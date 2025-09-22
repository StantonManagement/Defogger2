import type { Express } from "express";
import { createServer, type Server } from "http";
import { getAuthUrl, getTokenFromCode, testOneDriveConnection, getUserInfo } from "./auth";
import { createGitHubIssue, getTeamWorkload, getRepositoryCollaborators } from "./github";
import { githubIssueSchema } from "../shared/schema";
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
        title: 'User Authentication System',
        description: 'Implement secure user login and registration with JWT tokens',
        priority: 'high',
        component: 'Auth',
        estimatedDays: 5,
        assignedTo: '',
        status: 'ready'
      },
      {
        id: 'T-002', 
        title: 'Dashboard Analytics',
        description: 'Create real-time analytics dashboard with charts and metrics',
        priority: 'medium',
        component: 'Dashboard',
        estimatedDays: 8,
        assignedTo: '',
        status: 'ready'
      },
      {
        id: 'T-003',
        title: 'Mobile Responsive Design',
        description: 'Optimize UI for mobile devices and tablets',
        priority: 'medium',
        component: 'UI',
        estimatedDays: 6,
        assignedTo: '',
        status: 'ready'
      },
      {
        id: 'T-004',
        title: 'API Rate Limiting',
        description: 'Implement rate limiting for API endpoints to prevent abuse',
        priority: 'high',
        component: 'API',
        estimatedDays: 3,
        assignedTo: '',
        status: 'ready'
      },
      {
        id: 'T-005',
        title: 'Database Migration Tool',
        description: 'Create automated database migration and seeding system',
        priority: 'low',
        component: 'Database',
        estimatedDays: 4,
        assignedTo: '',
        status: 'ready'
      },
      {
        id: 'T-006',
        title: 'Email Notification Service',
        description: 'Set up email notifications for important system events',
        priority: 'medium',
        component: 'Notifications',
        estimatedDays: 5,
        assignedTo: '',
        status: 'ready'
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

  const httpServer = createServer(app);
  return httpServer;
}
