import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, TestTube, ExternalLink, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
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
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState(false);
  const [config, setConfig] = useState<APIConfig>({
    clientId: '',
    clientSecret: '',
    tenantId: '',
    redirectUri: `${window.location.origin}/auth/callback`,
    githubToken: '',
    githubRepo: import.meta.env.VITE_GITHUB_REPO || ''
  });
  
  const [testResults, setTestResults] = useState<any>(null);
  const [githubTestResults, setGithubTestResults] = useState<any>(null);
  const [githubConnected, setGithubConnected] = useState(false);

  // Check OneDrive connection status
  const { data: connectionStatus = {}, refetch: refetchStatus } = useQuery({
    queryKey: ['/api/onedrive/status'],
    refetchInterval: 5000 // Check every 5 seconds
  });

  // Fetch GitHub configuration
  const { data: githubConfig } = useQuery({
    queryKey: ['/api/github/config'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update repository field when GitHub config is loaded
  useEffect(() => {
    if ((githubConfig as any)?.success && (githubConfig as any)?.data?.repository) {
      setConfig(prev => ({ 
        ...prev, 
        githubRepo: (githubConfig as any).data.repository 
      }));
    }
  }, [githubConfig]);

  // Connect to OneDrive mutation
  const connectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/auth/login');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
      return data;
    },
    onError: (error: any) => {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to initiate OneDrive connection",
        variant: "destructive"
      });
    }
  });

  // Test OneDrive connection mutation
  const testMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/onedrive/test', { method: 'POST' });
      return await response.json();
    },
    onSuccess: (data) => {
      setTestResults(data);
      if (data.success) {
        toast({
          title: "OneDrive Test Successful",
          description: `Found ${data.files?.length || 0} files in ${data.folderPath}`,
        });
      } else {
        toast({
          title: "OneDrive Test Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Test Connection Error",
        description: error.message || "Failed to test OneDrive connection",
        variant: "destructive"
      });
    }
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/onedrive/disconnect', { method: 'POST' });
      return await response.json();
    },
    onSuccess: () => {
      refetchStatus();
      setTestResults(null);
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from OneDrive",
      });
    }
  });

  // Check for connection success on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      toast({
        title: "OneDrive Connected",
        description: "Successfully connected to your OneDrive account",
      });
      refetchStatus();
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('error') === 'auth_failed') {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to OneDrive. Please try again.",
        variant: "destructive"
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleConfigChange = (field: keyof APIConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleConnectOneDrive = () => {
    connectMutation.mutate();
  };

  const handleTestConnection = () => {
    testMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  // GitHub test connection mutation
  const githubTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/github/collaborators', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setGithubTestResults(data);
      if (data.success) {
        setGithubConnected(true);
        toast({
          title: "✅ GitHub Connected",
          description: `Found ${data.data?.length || 0} collaborators in repository`,
        });
      } else {
        setGithubConnected(false);
        toast({
          title: "GitHub Connection Failed",
          description: data.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      setGithubConnected(false);
      setGithubTestResults({ success: false, error: error.message });
      toast({
        title: "GitHub Test Error",
        description: error.message || "Failed to test GitHub connection",
        variant: "destructive"
      });
    }
  });

  const handleTestGithub = () => {
    githubTestMutation.mutate();
  };

  // Auto-test GitHub connection when config is loaded and token exists
  useEffect(() => {
    if ((githubConfig as any)?.success && (githubConfig as any)?.data?.hasToken && (githubConfig as any)?.data?.repository) {
      githubTestMutation.mutate();
    }
  }, [githubConfig, githubTestMutation]);

  const saveConfiguration = () => {
    // Note: In production, secrets should be managed securely via environment variables
    // This is just for demo purposes
    toast({
      title: "Configuration Note",
      description: "API configuration is managed through Replit secrets for security",
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
              isConnected={(connectionStatus as any)?.connected || false}
              lastConnection={(connectionStatus as any)?.user?.displayName ? `Connected as ${(connectionStatus as any).user.displayName}` : ''}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OneDrive Demo Banner */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800 dark:text-blue-200">
              <strong>OneDrive: Using Demo Data (MFA pending)</strong> - Connect your Microsoft account to access real OneDrive data
            </span>
          </div>
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
          <div className="flex flex-wrap gap-2">
            {!(connectionStatus as any)?.connected ? (
              <Button 
                onClick={handleConnectOneDrive}
                disabled={connectMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-connect-onedrive"
              >
                <ExternalLink className="h-4 w-4" />
                {connectMutation.isPending ? 'Connecting...' : 'Connect to OneDrive'}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleTestConnection}
                  disabled={testMutation.isPending}
                  variant="outline" 
                  className="flex items-center gap-2"
                  data-testid="button-test-onedrive"
                >
                  <TestTube className="h-4 w-4" />
                  {testMutation.isPending ? 'Testing...' : 'Test Connection'}
                </Button>
                <Button 
                  onClick={handleDisconnect}
                  disabled={disconnectMutation.isPending}
                  variant="destructive" 
                  className="flex items-center gap-2"
                  data-testid="button-disconnect-onedrive"
                >
                  {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              </>
            )}
          </div>
          
          {/* Test Results */}
          {testResults && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">Test Results</h4>
              {testResults.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✓ Connection successful</p>
                  <p className="text-sm text-muted-foreground">Folder: {testResults.folderPath}</p>
                  <p className="text-sm text-muted-foreground">Files found: {testResults.files?.length || 0}</p>
                  {testResults.files?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Recent files:</p>
                      <ul className="text-xs text-muted-foreground ml-4">
                        {testResults.files.slice(0, 3).map((file: any, index: number) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                        {testResults.files.length > 3 && <li>... and {testResults.files.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">✗ Connection failed</p>
                  <p className="text-sm text-muted-foreground">Error: {testResults.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GitHub Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            GitHub Configuration
            <ConnectionStatus 
              service="GitHub" 
              isConnected={githubConnected}
              lastConnection={githubConnected ? `✅ Connected to ${(githubConfig as any)?.data?.repository || 'repository'}` : ''}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="githubToken">GitHub Token</Label>
              <Input
                id="githubToken"
                type="text"
                value={(githubConfig as any)?.data?.hasToken ? "••••••••••••••••" : "Not configured"}
                readOnly
                className="bg-muted"
                data-testid="input-github-token"
              />
              <p className="text-xs text-muted-foreground mt-1">Managed via Replit secrets (GITHUB_TOKEN)</p>
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
          {/* GitHub Status Banner */}
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 dark:text-green-200">
              <strong>GitHub: Active</strong> - Create real GitHub issues and track team workload
            </span>
          </div>
          
          <Button 
            onClick={handleTestGithub}
            disabled={githubTestMutation.isPending}
            variant="outline" 
            className="flex items-center gap-2"
            data-testid="button-test-github"
          >
            <TestTube className="h-4 w-4" />
            {githubTestMutation.isPending ? 'Testing...' : 'Test Connection'}
          </Button>
          
          {/* GitHub Test Results */}
          {githubTestResults && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium mb-2">GitHub Test Results</h4>
              {githubTestResults.success ? (
                <div className="space-y-2">
                  <p className="text-sm text-green-600">✓ Connection successful</p>
                  <p className="text-sm text-muted-foreground">Repository: {config.githubRepo || 'Not specified'}</p>
                  <p className="text-sm text-muted-foreground">Collaborators found: {githubTestResults.data?.length || 0}</p>
                  {githubTestResults.data?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium">Collaborators:</p>
                      <ul className="text-xs text-muted-foreground ml-4">
                        {githubTestResults.data.slice(0, 3).map((collaborator: any, index: number) => (
                          <li key={index}>• {collaborator.login}</li>
                        ))}
                        {githubTestResults.data.length > 3 && <li>... and {githubTestResults.data.length - 3} more</li>}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-red-600">✗ Connection failed</p>
                  <p className="text-sm text-muted-foreground">Error: {githubTestResults.error}</p>
                </div>
              )}
            </div>
          )}
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