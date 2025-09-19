import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle, Key, Github } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HelpTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium">Microsoft Azure (OneDrive)</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Visit the Azure Portal and navigate to "App registrations"</li>
              <li>Click "New registration" and provide an app name</li>
              <li>Set redirect URI to your application URL + "/auth/callback"</li>
              <li>Note down the Application (client) ID and Directory (tenant) ID</li>
              <li>Go to "Certificates & secrets" and create a new client secret</li>
              <li>Configure API permissions for Microsoft Graph (Files.ReadWrite)</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade', '_blank')}
              data-testid="link-azure-portal"
            >
              <ExternalLink className="h-3 w-3" />
              Open Azure Portal
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Token Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
              <li>Click "Generate new token (classic)"</li>
              <li>Select scopes: repo (full repository access)</li>
              <li>Copy the generated token immediately (you won't see it again)</li>
              <li>Ensure you have access to the repository you want to connect</li>
            </ol>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => window.open('https://github.com/settings/tokens', '_blank')}
              data-testid="link-github-tokens"
            >
              <ExternalLink className="h-3 w-3" />
              Create GitHub Token
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Common Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Connection Failed:</strong> Verify your credentials are correct and that the redirect URI matches exactly in your Azure app registration.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Permission Denied:</strong> Ensure your Azure app has the correct Microsoft Graph API permissions and admin consent has been granted if required.
            </AlertDescription>
          </Alert>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>GitHub Repository Not Found:</strong> Check that the repository exists, you have access to it, and the format is "owner/repo-name".
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2">
            <h4 className="font-medium text-sm">Still having issues?</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Check the browser console for detailed error messages</li>
              <li>Verify your network connection and firewall settings</li>
              <li>Try refreshing the page and reconnecting</li>
              <li>Clear browser cache and cookies for this site</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}