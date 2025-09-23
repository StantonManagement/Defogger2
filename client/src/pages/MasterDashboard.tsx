import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Users, DollarSign, Clock, Target } from "lucide-react";
import { Link } from "wouter";

interface ProjectStat {
  project: string;
  name: string;
  componentsInProgress: number;
  totalComponents: number;
  budgetUsed: number;
  totalBudget: number;
  activeDevelopers: number;
  pendingPayments: number;
}

interface MultiProjectStats {
  projectStats: ProjectStat[];
  crossProjectTasks: number;
  overCapacityDevelopers: string[];
  blockedComponents: Array<{
    component: string;
    project: string;
    blockedBy: string;
  }>;
}

export default function MasterDashboard() {
  const { data: stats, isLoading } = useQuery<{ success: boolean; data: MultiProjectStats }>({
    queryKey: ['/api/projects/stats'],
  });

  const multiProjectStats = stats?.data;

  const getProjectStatusColor = (budgetUsed: number, totalBudget: number) => {
    const percentage = (budgetUsed / totalBudget) * 100;
    if (percentage >= 80) return 'text-red-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (componentsInProgress: number, totalComponents: number) => {
    const percentage = (componentsInProgress / totalComponents) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Dashboard</h1>
          <p className="text-muted-foreground">Overview of all projects and cross-project status</p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/projects/new">
            <Button data-testid="button-create-project">Create Project</Button>
          </Link>
          <Link href="/dependencies">
            <Button variant="outline" data-testid="button-manage-dependencies">
              Manage Dependencies
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-projects">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-7 bg-muted rounded w-12"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-projects">
                {multiProjectStats?.projectStats.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card data-testid="card-cross-project-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Project Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-7 bg-muted rounded w-12"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-cross-project-tasks">
                {multiProjectStats?.crossProjectTasks || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Multi-project dependencies</p>
          </CardContent>
        </Card>

        <Card data-testid="card-blocked-components">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Components</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-7 bg-muted rounded w-12"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-blocked-components">
                {multiProjectStats?.blockedComponents.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting dependencies</p>
          </CardContent>
        </Card>

        <Card data-testid="card-over-capacity">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Capacity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-7 bg-muted rounded w-12"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-over-capacity">
                {multiProjectStats?.overCapacityDevelopers.length || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Developers overloaded</p>
          </CardContent>
        </Card>
      </div>

      {/* Project Overview Cards */}
      <Card data-testid="card-projects-overview">
        <CardHeader>
          <CardTitle>All Projects Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-2 bg-muted rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : !multiProjectStats?.projectStats.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects found
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {multiProjectStats.projectStats.map((project) => {
                const progressPercentage = (project.componentsInProgress / project.totalComponents) * 100;
                const budgetPercentage = (project.budgetUsed / project.totalBudget) * 100;
                
                return (
                  <div 
                    key={project.project}
                    className="p-4 border rounded-lg hover-elevate"
                    data-testid={`project-card-${project.project}`}
                  >
                    <div className="space-y-4">
                      {/* Project Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant={project.componentsInProgress > 0 ? 'default' : 'secondary'}>
                          {project.componentsInProgress > 0 ? 'Active' : 'Planning'}
                        </Badge>
                      </div>
                      
                      {/* Progress Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Components Progress</span>
                          <span className="font-medium">
                            {project.componentsInProgress}/{project.totalComponents}
                          </span>
                        </div>
                        <Progress 
                          value={progressPercentage} 
                          className="h-2"
                        />
                      </div>
                      
                      {/* Budget Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Budget Used</span>
                          <span className={`font-medium ${getProjectStatusColor(project.budgetUsed, project.totalBudget)}`}>
                            ${project.budgetUsed.toFixed(0)}/${project.totalBudget.toFixed(0)}
                          </span>
                        </div>
                        <Progress 
                          value={budgetPercentage} 
                          className="h-2"
                        />
                      </div>
                      
                      {/* Stats Row */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{project.activeDevelopers} developers</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{project.pendingPayments} pending</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Link href={`/projects/${project.project}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/projects/${project.project}/components`}>
                          <Button size="sm" className="flex-1">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cross-Project Alerts */}
      {multiProjectStats && (multiProjectStats.blockedComponents.length > 0 || multiProjectStats.overCapacityDevelopers.length > 0) && (
        <Card data-testid="card-cross-project-alerts">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Cross-Project Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Blocked Components */}
              {multiProjectStats.blockedComponents.map((blocked, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  data-testid={`alert-blocked-${index}`}
                >
                  <div>
                    <p className="font-medium">
                      {blocked.component} ({blocked.project}) blocked by {blocked.blockedBy}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Dependency conflict preventing progress
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Resolve</Button>
                </div>
              ))}
              
              {/* Over-capacity Developers */}
              {multiProjectStats.overCapacityDevelopers.map((developer, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  data-testid={`alert-capacity-${index}`}
                >
                  <div>
                    <p className="font-medium">{developer} is over capacity this week</p>
                    <p className="text-sm text-muted-foreground">
                      Multiple project assignments exceeding recommended hours
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}