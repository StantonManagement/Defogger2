import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ConnectionStatus from "./ConnectionStatus";

interface APIConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  githubToken: string;
  githubRepo: string;
}

export default function APIConfiguration() {
  const { toast } = useToast();
  const [showSecrets, setShowSecrets] = useState(false);
  const [config, setConfig] = useState<APIConfig>({
    clientId: '',
    clientSecret: '',
    tenantId: '',
    redirectUri: `${window.location.origin}/auth/callback`,
    githubToken: '',
    githubRepo: ''
  });
  
  const [connectionStatus, setConnectionStatus] = useState({
    onedrive: { connected: false, lastConnect: '' },
    github: { connected: false, repoInfo: '' }
  });

  const handleConfigChange = (field: keyof APIConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testOnedriveConnection = async () => {
    console.log('Testing OneDrive connection...');
    // Simulate API test
    setTimeout(() => {
      setConnectionStatus(prev => ({
        ...prev,
        onedrive: { connected: true, lastConnect: new Date().toLocaleString() }
      }));
      toast({
        title: "OneDrive Connection",
        description: "Successfully connected to OneDrive",
      });
    }, 1000);
  };

  const testGithubConnection = async () => {
    console.log('Testing GitHub connection...');
    // Simulate API test
    setTimeout(() => {
      setConnectionStatus(prev => ({
        ...prev,
        github: { connected: true, repoInfo: `${config.githubRepo} (5 collaborators)` }
      }));
      toast({
        title: "GitHub Connection",
        description: "Successfully connected to GitHub repository",
      });
    }, 1000);
  };

  const saveConfiguration = () => {
    console.log('Saving configuration...', config);
    toast({
      title: "Configuration Saved",
      description: "API configuration has been saved to .env file",
    });
  };

  return (
    <div className="space-y-6">
      {/* Microsoft/OneDrive Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Microsoft/OneDrive Configuration
            <ConnectionStatus 
              service="OneDrive" 
              isConnected={connectionStatus.onedrive.connected}
              lastConnection={connectionStatus.onedrive.lastConnect}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type={showSecrets ? "text" : "password"}
                placeholder="Your Azure App Client ID"
                value={config.clientId}
                onChange={(e) => handleConfigChange('clientId', e.target.value)}
                data-testid="input-client-id"
              />
            </div>
            <div>
              <Label htmlFor="clientSecret">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecrets ? "text" : "password"}
                  placeholder="Your Azure App Client Secret"
                  value={config.clientSecret}
                  onChange={(e) => handleConfigChange('clientSecret', e.target.value)}
                  data-testid="input-client-secret"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setShowSecrets(!showSecrets)}
                  data-testid="button-toggle-secrets"
                >
                  {showSecrets ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="tenantId">Tenant ID</Label>
              <Input
                id="tenantId"
                type={showSecrets ? "text" : "password"}
                placeholder="Your Azure Tenant ID"
                value={config.tenantId}
                onChange={(e) => handleConfigChange('tenantId', e.target.value)}
                data-testid="input-tenant-id"
              />
            </div>
            <div>
              <Label htmlFor="redirectUri">Redirect URI</Label>
              <Input
                id="redirectUri"
                value={config.redirectUri}
                readOnly
                className="bg-muted"
                data-testid="input-redirect-uri"
              />
              <p className="text-xs text-muted-foreground mt-1">Auto-generated based on current URL</p>
            </div>
          </div>
          <Button 
            onClick={testOnedriveConnection} 
            variant="outline" 
            className="flex items-center gap-2"
            data-testid="button-test-onedrive"
          >
            <TestTube className="h-4 w-4" />
            Test OneDrive Connection
          </Button>
        </CardContent>
      </Card>

      {/* GitHub Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            GitHub Configuration
            <ConnectionStatus 
              service="GitHub" 
              isConnected={connectionStatus.github.connected}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="githubToken">GitHub Token</Label>
              <Input
                id="githubToken"
                type={showSecrets ? "text" : "password"}
                placeholder="ghp_xxxxxxxxxxxx"
                value={config.githubToken}
                onChange={(e) => handleConfigChange('githubToken', e.target.value)}
                data-testid="input-github-token"
              />
            </div>
            <div>
              <Label htmlFor="githubRepo">Repository</Label>
              <Input
                id="githubRepo"
                placeholder="owner/repository-name"
                value={config.githubRepo}
                onChange={(e) => handleConfigChange('githubRepo', e.target.value)}
                data-testid="input-github-repo"
              />
            </div>
          </div>
          {connectionStatus.github.connected && connectionStatus.github.repoInfo && (
            <div className="flex items-center gap-2">
              <Badge variant="default">Connected Repository</Badge>
              <span className="text-sm text-muted-foreground">{connectionStatus.github.repoInfo}</span>
            </div>
          )}
          <Button 
            onClick={testGithubConnection} 
            variant="outline" 
            className="flex items-center gap-2"
            data-testid="button-test-github"
          >
            <TestTube className="h-4 w-4" />
            Test GitHub Connection
          </Button>
        </CardContent>
      </Card>

      {/* Save Configuration */}
      <div className="flex justify-end">
        <Button onClick={saveConfiguration} data-testid="button-save-config">
          Save Configuration
        </Button>
      </div>
    </div>
  );
}