import type { Express } from "express";
import { createServer, type Server } from "http";
import { getAuthUrl, getTokenFromCode, testOneDriveConnection, getUserInfo } from "./auth";
import { createGitHubIssue, getTeamWorkload, getRepositoryCollaborators } from "./github";
import { githubIssueSchema, paymentFormSchema } from "../shared/schema";
import { storage } from "./storage";
import "./types"; // Import session type extensions

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub Authentication Routes
  
  // Initiate GitHub OAuth
  app.get("/auth/github", async (req, res) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'GitHub OAuth not configured' });
    }
    
    // Generate cryptographically random state for CSRF protection
    const { randomBytes } = await import('crypto');
    const state = randomBytes(32).toString('hex');
    req.session.oauthState = state;
    
    // Use configured callback URL or fallback to dynamic construction
    const redirectUri = process.env.GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/github/callback`;
    console.log(`GitHub OAuth redirect URI: ${redirectUri}`);
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,project,read:org&state=${state}`;
    
    res.redirect(authUrl);
  });

  // Handle GitHub OAuth callback
  app.get("/auth/github/callback", async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent('Authorization code not provided'));
      }

      // Validate state parameter to prevent CSRF attacks
      if (!state || state !== req.session.oauthState) {
        return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent('Invalid state parameter'));
      }

      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent('GitHub OAuth not configured'));
      }

      // Use configured callback URL or fallback to dynamic construction
      const redirectUri = process.env.GITHUB_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/github/callback`;
      console.log(`GitHub OAuth callback URI: ${redirectUri}`);
      
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.error || !tokenData.access_token) {
        return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent(tokenData.error_description || 'Failed to get access token'));
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${tokenData.access_token}`,
          'User-Agent': 'DevTaskManager',
        },
      });

      const userData = await userResponse.json();
      
      if (!userData.id) {
        return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent('Failed to get user info'));
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent('Session error'));
        }
        
        // Store token and user in new session
        req.session.githubAccessToken = tokenData.access_token;
        req.session.githubUser = {
          id: userData.id,
          login: userData.login,
          avatar_url: userData.avatar_url,
          html_url: userData.html_url,
          name: userData.name,
        };
        
        // Clear the OAuth state
        req.session.oauthState = undefined;
        
        console.log('OAuth setup complete!');
        res.redirect('/dashboard');
      });
    } catch (error: any) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect('/settings?error=github_auth_failed&message=' + encodeURIComponent(error.message || 'OAuth failed'));
    }
  });

  // Get logged-in user info
  app.get("/api/user", (req, res) => {
    if (!req.session.githubAccessToken || !req.session.githubUser) {
      return res.status(401).json({
        success: false,
        error: 'Not logged in with GitHub'
      });
    }

    res.json({
      success: true,
      user: req.session.githubUser,
      connected: true
    });
  });

  // GitHub logout
  app.post("/api/github/logout", (req, res) => {
    req.session.githubAccessToken = undefined;
    req.session.githubUser = undefined;
    
    res.json({
      success: true,
      message: 'Logged out from GitHub'
    });
  });

  // OneDrive Authentication Routes
  
  // Initiate OAuth login
  app.get("/auth/login", async (req, res) => {
    try {
      const authUrl = await getAuthUrl();
      res.json({ authUrl });
    } catch (error: any) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate authentication URL' 
      });
    }
  });

  // Handle OAuth callback
  app.get("/auth/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        res.status(400).json({ 
          success: false, 
          error: 'Authorization code not provided' 
        });
        return;
      }

      // Exchange code for access token
      const accessToken = await getTokenFromCode(code as string);
      
      // Store token in session
      req.session.accessToken = accessToken;
      
      // Get user info
      const userInfo = await getUserInfo(accessToken);
      if (userInfo.success) {
        req.session.user = userInfo.user;
      }
      
      // Redirect to settings page with success
      res.redirect('/settings?connected=true');
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      res.redirect('/settings?error=auth_failed');
    }
  });

  // Check OneDrive connection status
  app.get("/api/onedrive/status", (req, res) => {
    const isConnected = !!req.session.accessToken;
    const user = req.session.user || null;
    
    res.json({
      connected: isConnected,
      user: user
    });
  });

  // Test OneDrive connection
  app.post("/api/onedrive/test", async (req, res) => {
    try {
      const accessToken = req.session.accessToken;
      
      if (!accessToken) {
        res.status(401).json({ 
          success: false, 
          error: 'Not authenticated. Please connect to OneDrive first.' 
        });
        return;
      }

      const result = await testOneDriveConnection(accessToken);
      res.json(result);
    } catch (error: any) {
      console.error('Test connection error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to test OneDrive connection' 
      });
    }
  });

  // Disconnect from OneDrive
  app.post("/api/onedrive/disconnect", (req, res) => {
    // Clear session data
    req.session.accessToken = undefined;
    req.session.user = undefined;
    
    res.json({ 
      success: true, 
      message: 'Disconnected from OneDrive' 
    });
  });

  // GitHub API Routes
  
  // Create GitHub issue
  app.post("/api/github/issue", async (req, res) => {
    try {
      const githubToken = req.session.githubAccessToken;
      if (!githubToken) {
        return res.status(401).json({
          success: false,
          error: 'GitHub authentication required'
        });
      }
      
      const validatedData = githubIssueSchema.parse(req.body);
      const result = await createGitHubIssue(validatedData, githubToken);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error('Error creating GitHub issue:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to create GitHub issue' 
      });
    }
  });

  // Get team workload from GitHub
  app.get("/api/github/workload", async (req, res) => {
    try {
      const githubToken = req.session.githubAccessToken;
      if (!githubToken) {
        return res.status(401).json({
          success: false,
          error: 'GitHub authentication required'
        });
      }
      
      const result = await getTeamWorkload(githubToken);
      
      if (result.success) {
        res.json({ 
          success: true, 
          data: result.data 
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error: any) {
      console.error('Error fetching team workload:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch team workload' 
      });
    }
  });

  // Get repository collaborators
  app.get("/api/github/collaborators", async (req, res) => {
    try {
      const githubToken = req.session.githubAccessToken;
      if (!githubToken) {
        return res.status(401).json({
          success: false,
          error: 'GitHub authentication required'
        });
      }
      
      const result = await getRepositoryCollaborators(githubToken);
      
      if (result.success) {
        res.json({ 
          success: true, 
          data: result.data 
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error: any) {
      console.error('Error fetching collaborators:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch repository collaborators' 
      });
    }
  });

  // Mock Tasks endpoint for Ready Tasks page
  app.get("/api/mock-tasks", (req, res) => {
    const mockTasks = [
      {
        id: 'T-001',
        title: 'API Framework Core Module',
        description: 'Implement core API framework with authentication, validation, and routing',
        priority: 'high',
        component: 'api_framework',
        estimatedDays: 5,
        assignedTo: 'Paul Limbo',
        status: 'ready',
        paymentStatus: 'pending',
        budget: 2400,
        project: 'collections_system'
      },
      {
        id: 'T-002', 
        title: 'Task Queue Processing System',
        description: 'Create async task queue with Redis backend for collection processing',
        priority: 'high',
        component: 'task_queue',
        estimatedDays: 6,
        assignedTo: 'Jose Enrico Maxino',
        status: 'ready',
        paymentStatus: 'sent',
        budget: 2880,
        project: 'collections_system'
      },
      {
        id: 'T-003',
        title: 'Event Bus Communication Layer',
        description: 'Implement event-driven communication between collection system components',
        priority: 'medium',
        component: 'event_bus',
        estimatedDays: 4,
        assignedTo: 'Christian Sumoba',
        status: 'ready',
        paymentStatus: 'confirmed',
        budget: 1920,
        project: 'collections_system'
      },
      {
        id: 'T-004',
        title: 'Notification Service Integration',
        description: 'Build multi-channel notification system for collection updates',
        priority: 'medium',
        component: 'notifications',
        estimatedDays: 5,
        assignedTo: 'Cedrick Barzaga',
        status: 'ready',
        paymentStatus: 'pending',
        budget: 2400,
        project: 'collections_system'
      },
      {
        id: 'T-005',
        title: 'Document Processing Pipeline',
        description: 'Create automated document parsing and validation for collections',
        priority: 'high',
        component: 'documents',
        estimatedDays: 7,
        assignedTo: 'Gabriel Jerdhy Lapuz',
        status: 'ready',
        paymentStatus: 'sent',
        budget: 3360,
        project: 'collections_system'
      },
      {
        id: 'T-006',
        title: 'SMS Agent Communication Module',
        description: 'Implement SMS-based collection agent communication system',
        priority: 'medium',
        component: 'sms_agent',
        estimatedDays: 4,
        assignedTo: 'Kurt',
        status: 'ready',
        paymentStatus: 'confirmed',
        budget: 1920,
        project: 'collections_system'
      }
    ];

    res.json({
      success: true,
      data: mockTasks,
      count: mockTasks.length
    });
  });

  // Get GitHub configuration
  app.get("/api/github/config", (req, res) => {
    res.json({
      success: true,
      data: {
        repository: process.env.GITHUB_REPO || 'StantonManagement/Defogger2',
        hasToken: !!req.session.githubAccessToken,
        connected: !!req.session.githubAccessToken,
        user: req.session.githubUser
      }
    });
  });

  // Get GitHub rate limit status
  app.get("/api/github/rate-limit", async (req, res) => {
    try {
      const githubToken = req.session.githubAccessToken;
      if (!githubToken) {
        return res.status(401).json({
          success: false,
          error: 'GitHub authentication required'
        });
      }
      
      const { getOctokit } = await import("./github");
      const octokit = getOctokit(githubToken);
      const { data: rateLimit } = await octokit.rest.rateLimit.get();
      
      res.json({
        success: true,
        data: {
          remaining: rateLimit.rate.remaining,
          limit: rateLimit.rate.limit,
          used: rateLimit.rate.used,
          reset: new Date(rateLimit.rate.reset * 1000).toISOString(),
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch rate limit status"
      });
    }
  });

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Task Management API Routes
  
  // Get all folders with counts
  app.get("/api/folders", async (req, res) => {
    try {
      const { mockFolders } = await import("../shared/mockData");
      res.json({
        success: true,
        data: mockFolders
      });
    } catch (error: any) {
      console.error('Error fetching folders:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch folders' 
      });
    }
  });

  // Get workflow statistics  
  app.get("/api/workflow/stats", async (req, res) => {
    try {
      const { mockWorkflowStats } = await import("../shared/mockData");
      res.json({
        success: true,
        data: mockWorkflowStats
      });
    } catch (error: any) {
      console.error('Error fetching workflow stats:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch workflow stats' 
      });
    }
  });

  // Get all tasks in a folder
  app.get("/api/tasks/:folder", async (req, res) => {
    try {
      const { folder } = req.params;
      const { mockTasks } = await import("../shared/mockData");
      
      const folderTasks = mockTasks[folder];
      if (!folderTasks) {
        return res.status(404).json({
          success: false,
          error: `Folder '${folder}' not found`
        });
      }

      res.json({
        success: true,
        data: folderTasks
      });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch tasks' 
      });
    }
  });

  // Get single task by folder and filename
  app.get("/api/task/:folder/:filename", async (req, res) => {
    try {
      const { folder, filename } = req.params;
      const { mockTasks } = await import("../shared/mockData");
      
      const folderTasks = mockTasks[folder];
      if (!folderTasks) {
        return res.status(404).json({
          success: false,
          error: `Folder '${folder}' not found`
        });
      }

      const task = folderTasks.find(t => t.filename === filename);
      if (!task) {
        return res.status(404).json({
          success: false,
          error: `Task '${filename}' not found in folder '${folder}'`
        });
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error: any) {
      console.error('Error fetching task:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch task' 
      });
    }
  });

  // Get workflow documentation
  app.get("/api/workflow/:docname", async (req, res) => {
    try {
      const { docname } = req.params;
      const { mockWorkflowDocs } = await import("../shared/mockData");
      
      // Map docname to mockWorkflowDocs keys
      const keyMapping: Record<string, string> = {
        'readme': 'README',
        'full-workflow': 'FULL_WORKFLOW', 
        'quick-reference': 'QUICK_REFERENCE'
      };
      
      const key = keyMapping[docname];
      if (!key) {
        return res.status(404).json({
          success: false,
          error: `Documentation '${docname}' not found`
        });
      }
      
      const doc = mockWorkflowDocs[key as keyof typeof mockWorkflowDocs];
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: `Documentation content for '${docname}' not found`
        });
      }

      res.json({
        success: true,
        data: doc
      });
    } catch (error: any) {
      console.error('Error fetching workflow doc:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Failed to fetch workflow documentation' 
      });
    }
  });

  // ==================== PAYMENT API ENDPOINTS ====================

  // GET /api/payments - Get list of all payments with filters
  app.get("/api/payments", async (req, res) => {
    try {
      const { developer, status, from_date, to_date } = req.query;
      
      const filters = {
        developerName: developer as string | undefined,
        status: status as string | undefined,
        fromDate: from_date as string | undefined,
        toDate: to_date as string | undefined,
      };

      const payments = await storage.getPayments(filters);
      
      res.json({
        success: true,
        data: payments,
        count: payments.length,
      });
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payments',
      });
    }
  });

  // POST /api/payments - Record a new payment
  app.post("/api/payments", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validatedData = paymentFormSchema.parse(req.body);
      
      // Convert amount to string for storage (decimal fields are stored as strings)
      const paymentData = {
        ...validatedData,
        amount: validatedData.amount.toString(),
      };
      
      const payment = await storage.createPayment(paymentData);
      
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Payment recorded successfully',
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create payment',
      });
    }
  });

  // GET /api/payments/ledger - Get all developer ledgers
  app.get("/api/payments/ledger", async (req, res) => {
    try {
      const ledgers = await storage.getDeveloperLedgers();
      
      // Include recent payments for each developer
      const ledgersWithPayments = await Promise.all(
        ledgers.map(async (ledger) => {
          const recentPayments = await storage.getPayments({ 
            developerName: ledger.developerName 
          });
          
          return {
            ...ledger,
            recentPayments: recentPayments.slice(0, 3), // Last 3 payments
          };
        })
      );
      
      res.json({
        success: true,
        data: ledgersWithPayments,
      });
    } catch (error: any) {
      console.error('Error fetching ledger:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch developer ledger',
      });
    }
  });

  // PUT /api/payments/:id/status - Update payment status
  app.put("/api/payments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'sent', 'confirmed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment status. Must be pending, sent, or confirmed',
        });
      }
      
      const updatedPayment = await storage.updatePaymentStatus(id, status);
      
      if (!updatedPayment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }
      
      res.json({
        success: true,
        data: updatedPayment,
        message: `Payment status updated to ${status}`,
      });
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update payment status',
      });
    }
  });

  // GET /api/payments/stats - Dashboard statistics
  app.get("/api/payments/stats", async (req, res) => {
    try {
      const stats = await storage.getPaymentStats();
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error fetching payment stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment statistics',
      });
    }
  });

  // POST /api/payments/bulk - Mark multiple payments as paid (for test projects)
  app.post("/api/payments/bulk", async (req, res) => {
    try {
      const { payment_ids, status } = req.body;
      
      if (!payment_ids || !Array.isArray(payment_ids) || payment_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'payment_ids array is required and cannot be empty',
        });
      }
      
      if (!status || !['pending', 'sent', 'confirmed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment status. Must be pending, sent, or confirmed',
        });
      }
      
      const updatedPayments = await storage.bulkUpdatePaymentStatus(payment_ids, status);
      
      res.json({
        success: true,
        data: updatedPayments,
        message: `${updatedPayments.length} payments updated to ${status}`,
        count: updatedPayments.length,
      });
    } catch (error: any) {
      console.error('Error bulk updating payments:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update payments',
      });
    }
  });

  // GET /api/payments/:id - Get single payment details
  app.get("/api/payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await storage.getPayment(id);
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found',
        });
      }
      
      res.json({
        success: true,
        data: payment,
      });
    } catch (error: any) {
      console.error('Error fetching payment:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch payment',
      });
    }
  });

  // GET /api/developers - Get list of developers for dropdowns
  app.get("/api/developers", async (req, res) => {
    try {
      const ledgers = await storage.getDeveloperLedgers();
      const developers = ledgers.map(ledger => ({
        name: ledger.developerName,
        active: ledger.active,
        totalPaid: parseFloat(ledger.totalPaid || '0'),
        totalPending: parseFloat(ledger.totalPending || '0'),
      }));
      
      res.json({
        success: true,
        data: developers,
      });
    } catch (error: any) {
      console.error('Error fetching developers:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch developers',
      });
    }
  });

  // Multi-project API routes
  
  // Multi-project stats endpoint
  app.get('/api/projects/stats', async (req, res) => {
    try {
      const stats = await storage.getMultiProjectStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      console.error('Failed to get multi-project stats:', error);
      res.status(500).json({ success: false, error: 'Failed to get multi-project stats' });
    }
  });

  // Project management endpoints
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json({ success: true, data: projects });
    } catch (error: any) {
      console.error('Failed to get projects:', error);
      res.status(500).json({ success: false, error: 'Failed to get projects' });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, data: project });
    } catch (error: any) {
      console.error('Failed to get project:', error);
      res.status(500).json({ success: false, error: 'Failed to get project' });
    }
  });

  app.post('/api/projects', async (req, res) => {
    try {
      const projectData = req.body;
      const project = await storage.createProject(projectData);
      res.json({ success: true, data: project });
    } catch (error: any) {
      console.error('Failed to create project:', error);
      res.status(500).json({ success: false, error: 'Failed to create project' });
    }
  });

  app.put('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const project = await storage.updateProject(id, updates);
      res.json({ success: true, data: project });
    } catch (error: any) {
      console.error('Failed to update project:', error);
      res.status(500).json({ success: false, error: 'Failed to update project' });
    }
  });

  // Component dependency endpoints
  app.get('/api/projects/:projectId/dependencies', async (req, res) => {
    try {
      const { projectId } = req.params;
      const dependencies = await storage.getComponentDependencies(projectId);
      res.json({ success: true, data: dependencies });
    } catch (error: any) {
      console.error('Failed to get dependencies:', error);
      res.status(500).json({ success: false, error: 'Failed to get dependencies' });
    }
  });

  app.post('/api/projects/:projectId/dependencies', async (req, res) => {
    try {
      const { projectId } = req.params;
      const dependencyData = { ...req.body, project: projectId };
      const dependency = await storage.addComponentDependency(dependencyData);
      res.json({ success: true, data: dependency });
    } catch (error: any) {
      console.error('Failed to add dependency:', error);
      res.status(500).json({ success: false, error: 'Failed to add dependency' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
