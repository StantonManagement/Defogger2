import { CheckSquare, Clock, AlertTriangle, Users, Github, TestTube } from "lucide-react";
import TaskStatsCard from "@/components/TaskStatsCard";
import ActivityFeed from "@/components/ActivityFeed";
import QuickActions from "@/components/QuickActions";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GitHubUser {
  id: string;
  login: string;
  name?: string;
  avatar_url: string;
  html_url: string;
}

interface UserResponse {
  success: boolean;
  user?: GitHubUser;
  error?: string;
  connected?: boolean;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [issueResponse, setIssueResponse] = useState<any>(null);
  
  // Fetch user login status
  const { data: user, isLoading: isUserLoading } = useQuery<UserResponse>({
    queryKey: ['/api/user'],
    enabled: true
  });

  // GitHub issue creation mutation
  const createIssueMutation = useMutation({
    mutationFn: async (issueData: any) => {
      const response = await apiRequest('POST', '/api/github/issue', issueData);
      return response.json();
    },
    onSuccess: (data) => {
      setIssueResponse(data);
      toast({
        title: "GitHub Issue Created",
        description: data.success ? `Issue created successfully! URL: ${data.issue?.url}` : `Error: ${data.error}`,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Issue",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const handleCreateTestIssue = () => {
    const testIssueData = {
      title: "Test from Defogger2 - OAuth Working",
      description: "This issue was created via OAuth integration",
      priority: "low"
    };
    
    createIssueMutation.mutate(testIssueData);
  };

  // Mock data
  const mockActivities = [
    {
      id: '1',
      action: 'Task "Implement user authentication" pushed to',
      user: 'Kurt Anderson',
      timestamp: '2 minutes ago',
      type: 'assignment' as const,
      status: 'success' as const
    },
    {
      id: '2',
      action: 'Decision "Migrate to TypeScript" was approved',
      timestamp: '5 minutes ago',
      type: 'decision' as const,
      status: 'success' as const
    },
    {
      id: '3',
      action: 'New task created: "Add payment processing"',
      timestamp: '12 minutes ago',
      type: 'task' as const,
      status: 'info' as const
    },
    {
      id: '4',
      action: 'Task "Fix login bug" assigned to',
      user: 'Sarah Chen',
      timestamp: '18 minutes ago',
      type: 'assignment' as const,
      status: 'success' as const
    },
    {
      id: '5',
      action: 'Decision "Use React Query" pending approval',
      timestamp: '25 minutes ago',
      type: 'decision' as const,
      status: 'warning' as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your development team's task flow and productivity
          </p>
        </div>
        
        {/* GitHub User Status */}
        <div className="flex items-center space-x-4">
          {isUserLoading ? (
            <Badge variant="secondary" data-testid="status-loading">Loading...</Badge>
          ) : user?.success && user.user ? (
            <div className="flex items-center space-x-3" data-testid="user-logged-in">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user.avatar_url} alt={user.user.login} />
                <AvatarFallback>{user.user.login?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Github className="h-4 w-4" />
                  <span className="font-medium text-sm">{user.user.login}</span>
                </div>
                <Badge variant="default" className="text-xs">Connected</Badge>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2" data-testid="user-not-logged-in">
              <Github className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">Not Connected</Badge>
            </div>
          )}
        </div>
      </div>

      {/* GitHub Issue Test Section */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>GitHub Integration Test</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleCreateTestIssue}
              disabled={createIssueMutation.isPending || !user?.success}
              data-testid="button-create-test-issue"
            >
              {createIssueMutation.isPending ? "Creating Issue..." : "Create Test GitHub Issue"}
            </Button>
            {!user?.success && (
              <Badge variant="secondary">GitHub connection required</Badge>
            )}
          </div>
          
          {issueResponse && (
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium mb-3">API Response</h4>
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto mb-3" data-testid="text-api-response">
                {JSON.stringify(issueResponse, null, 2)}
              </pre>
              {issueResponse.success && issueResponse.issue?.url && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✅ Issue Created Successfully!
                  </p>
                  <a 
                    href={issueResponse.issue.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    data-testid="link-github-issue"
                  >
                    View Issue: {issueResponse.issue.url}
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TaskStatsCard
          title="Ready Tasks"
          value={23}
          subtitle="awaiting assignment"
          trend="up"
          trendValue="+3 today"
          icon={<CheckSquare className="h-4 w-4" />}
          color="success"
        />
        <TaskStatsCard
          title="Assigned Tasks"
          value={15}
          subtitle="in progress"
          trend="neutral"
          trendValue="stable"
          icon={<Clock className="h-4 w-4" />}
          color="default"
        />
        <TaskStatsCard
          title="Pending Decisions"
          value={7}
          subtitle="need approval"
          trend="down"
          trendValue="-2 today"
          icon={<AlertTriangle className="h-4 w-4" />}
          color="warning"
        />
        <TaskStatsCard
          title="Team Capacity"
          value={8}
          subtitle="tasks available"
          trend="up"
          trendValue="+2 capacity"
          icon={<Users className="h-4 w-4" />}
          color="success"
        />
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed activities={mockActivities} />
        <QuickActions />
      </div>
    </div>
  );
}