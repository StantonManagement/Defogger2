import type { Express } from "express";
import { createServer, type Server } from "http";
import { getAuthUrl, getTokenFromCode, testOneDriveConnection, getUserInfo } from "./auth";
import { createGitHubIssue, getTeamWorkload, getRepositoryCollaborators } from "./github";
import { githubIssueSchema } from "../shared/schema";
import "./types"; // Import session type extensions

export async function registerRoutes(app: Express): Promise<Server> {
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
      const validatedData = githubIssueSchema.parse(req.body);
      const result = await createGitHubIssue(validatedData);
      
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
      const result = await getTeamWorkload();
      
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
      const result = await getRepositoryCollaborators();
      
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
