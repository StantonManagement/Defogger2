import { ConfidentialClientApplication } from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

// Custom authentication provider for Microsoft Graph
class TokenAuthenticationProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

// MSAL configuration
const msalConfig = {
  auth: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`
  }
};

const msalInstance = new ConfidentialClientApplication(msalConfig);

// Generate OAuth login URL
export async function getAuthUrl(): Promise<string> {
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:5000/auth/callback';
  
  const authCodeUrlParameters = {
    scopes: ['https://graph.microsoft.com/Files.ReadWrite.All', 'https://graph.microsoft.com/User.Read'],
    redirectUri: redirectUri,
  };

  return await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
}

// Exchange authorization code for access token
export async function getTokenFromCode(code: string): Promise<string> {
  const redirectUri = process.env.REDIRECT_URI || 'http://localhost:5000/auth/callback';
  
  const tokenRequest = {
    code: code,
    scopes: ['https://graph.microsoft.com/Files.ReadWrite.All', 'https://graph.microsoft.com/User.Read'],
    redirectUri: redirectUri,
  };

  try {
    const response = await msalInstance.acquireTokenByCode(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring token:', error);
    throw new Error('Failed to acquire access token');
  }
}

// Create Microsoft Graph client with access token
export function createGraphClient(accessToken: string): Client {
  const authProvider = new TokenAuthenticationProvider(accessToken);
  return Client.initWithMiddleware({ authProvider });
}

// Test OneDrive connection by listing files
export async function testOneDriveConnection(accessToken: string): Promise<any> {
  try {
    const graphClient = createGraphClient(accessToken);
    
    // List files in OneDrive root or specific folder
    const folderPath = process.env.ONEDRIVE_FOLDER_PATH || '/';
    let driveItemsUrl = '/me/drive/root/children';
    
    if (folderPath !== '/') {
      // If specific folder path is provided, use it
      driveItemsUrl = `/me/drive/root:${folderPath}:/children`;
    }
    
    const driveItems = await graphClient.api(driveItemsUrl).get();
    
    return {
      success: true,
      files: driveItems.value || [],
      folderPath: folderPath
    };
  } catch (error) {
    console.error('OneDrive test connection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      folderPath: process.env.ONEDRIVE_FOLDER_PATH || '/'
    };
  }
}

// Get user info
export async function getUserInfo(accessToken: string): Promise<any> {
  try {
    const graphClient = createGraphClient(accessToken);
    const user = await graphClient.api('/me').get();
    return {
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        mail: user.mail || user.userPrincipalName
      }
    };
  } catch (error) {
    console.error('Error getting user info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}