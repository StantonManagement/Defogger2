import TeamWorkloadCard from "@/components/TeamWorkloadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { GitHubWorkload } from "../../shared/schema";

export default function TeamWorkloadPage() {
  const { toast } = useToast();
  
  // Fetch real GitHub workload data
  const { data: workloadData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/github/workload'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data as fallback
  const mockTeam = [
    {
      id: 'dev-1',
      name: 'Kurt Anderson',
      currentLoad: 4,
      maxLoad: 5,
      tasks: [
        { id: 'T-001', title: 'User authentication system', priority: 'high' as const, daysLeft: 3 },
        { id: 'T-002', title: 'API documentation', priority: 'medium' as const, daysLeft: 7 },
        { id: 'T-003', title: 'Database migration', priority: 'low' as const, daysLeft: 14 },
        { id: 'T-004', title: 'Bug fixes', priority: 'high' as const, daysLeft: 2 }
      ]
    },
    {
      id: 'dev-2',
      name: 'Sarah Chen',
      currentLoad: 2,
      maxLoad: 5,
      tasks: [
        { id: 'T-005', title: 'Mobile responsive design', priority: 'high' as const, daysLeft: 5 },
        { id: 'T-006', title: 'Performance optimization', priority: 'medium' as const, daysLeft: 10 }
      ]
    },
    {
      id: 'dev-3',
      name: 'Mike Johnson',
      currentLoad: 5,
      maxLoad: 5,
      tasks: [
        { id: 'T-007', title: 'Dark mode implementation', priority: 'medium' as const, daysLeft: 4 },
        { id: 'T-008', title: 'Email service integration', priority: 'high' as const, daysLeft: 6 },
        { id: 'T-009', title: 'Testing framework setup', priority: 'low' as const, daysLeft: 12 },
        { id: 'T-010', title: 'Code review', priority: 'medium' as const, daysLeft: 1 },
        { id: 'T-011', title: 'Security audit', priority: 'high' as const, daysLeft: 8 }
      ]
    },
    {
      id: 'dev-4',
      name: 'Alex Rodriguez',
      currentLoad: 1,
      maxLoad: 4,
      tasks: [
        { id: 'T-012', title: 'Database optimization', priority: 'low' as const, daysLeft: 15 }
      ]
    }
  ];

  // Use real data if available, otherwise fall back to mock data
  const teamData = (workloadData as any)?.success ? (workloadData as any).data : mockTeam;
  
  // Calculate summary stats
  const totalTasks = teamData.reduce((sum: number, member: any) => sum + (member.totalIssues || member.currentLoad), 0);
  const totalCapacity = teamData.reduce((sum: number, member: any) => sum + (member.maxLoad || 5), 0);
  const availableCapacity = totalCapacity - totalTasks;
  const averagePerDev = teamData.length > 0 ? totalTasks / teamData.length : 0;
  
  // Find best assignee (lowest current load)
  const bestAssignee = teamData
    .filter((member: any) => (member.totalIssues || member.currentLoad) < (member.maxLoad || 5))
    .sort((a: any, b: any) => (a.totalIssues || a.currentLoad) - (b.totalIssues || b.currentLoad))[0];

  const handleSuggestAssignment = () => {
    if (bestAssignee) {
      toast({
        title: "Assignment Suggestion",
        description: `Recommend assigning next high-priority task to ${bestAssignee.name || bestAssignee.login} (lowest current load: ${bestAssignee.totalIssues || bestAssignee.currentLoad} tasks)`,
      });
    } else {
      toast({
        title: "No Available Capacity",
        description: "All team members are at maximum capacity",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest workload from GitHub...",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Workload</h1>
        <p className="text-muted-foreground">
          Monitor team capacity and distribute tasks efficiently
        </p>
        
        {/* Data source indicator */}
        <div className="mt-2 flex items-center gap-2">
          {(workloadData as any)?.success ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              Live GitHub Data
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
              {error ? 'GitHub API Error - Using Mock Data' : isLoading ? 'Loading...' : 'Mock Data'}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="ml-2"
            data-testid="button-refresh-workload"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        </div>
        
        {error && (
          <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">
              GitHub API Error: {(error as any).message}
            </span>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Overview
            </span>
            <Button 
              variant="outline" 
              onClick={handleSuggestAssignment}
              className="flex items-center gap-2"
              data-testid="button-suggest-assignment"
            >
              <Lightbulb className="h-4 w-4" />
              Suggest Assignment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{totalTasks}</span>
              <span className="text-muted-foreground">Total tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{availableCapacity}</span>
              <span className="text-muted-foreground">Available capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{averagePerDev.toFixed(1)}</span>
              <span className="text-muted-foreground">Avg per developer</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {teamData.filter((m: any) => (m.totalIssues || m.currentLoad) / (m.maxLoad || 5) >= 0.9).length} overloaded
              </Badge>
              <Badge variant="outline" className="text-sm">
                {teamData.filter((m: any) => (m.totalIssues || m.currentLoad) / (m.maxLoad || 5) <= 0.4).length} available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          teamData.map((member: any) => (
            <TeamWorkloadCard 
              key={member.id || member.login} 
              member={{
                ...member,
                id: member.id || member.login,
                name: member.name || member.login,
                currentLoad: member.totalIssues || member.currentLoad,
                maxLoad: member.maxLoad || 5,
                tasks: member.issues ? member.issues.map((issue: any) => ({
                  id: issue.id.toString(),
                  title: issue.title,
                  priority: issue.labels.find((l: any) => l.name.startsWith('priority:'))?.name.replace('priority:', '') || 'medium',
                  daysLeft: member.daysSinceOldest || Math.floor(Math.random() * 14) + 1,
                })) : member.tasks || []
              }} 
            />
          ))
        )}
      </div>
    </div>
  );
}