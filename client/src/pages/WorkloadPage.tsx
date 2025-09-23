import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

interface DeveloperWorkload {
  name: string;
  avatar?: string;
  tasksCount: number;
  capacity: number;
  oldestTaskDays: number;
  recentActivity: string;
  skills: string[];
  currentTasks: {
    title: string;
    priority: "high" | "medium" | "low";
    daysOpen: number;
  }[];
}

// Mock developer workload data
const mockDeveloperWorkloads: DeveloperWorkload[] = [
  {
    name: "Christian",
    avatar: "https://github.com/christian.png",
    tasksCount: 7,
    capacity: 70,
    oldestTaskDays: 8,
    recentActivity: "2 hours ago",
    skills: ["React", "TypeScript", "Node.js"],
    currentTasks: [
      { title: "OAuth Implementation", priority: "high", daysOpen: 8 },
      { title: "Dashboard UI Updates", priority: "medium", daysOpen: 3 },
      { title: "API Documentation", priority: "low", daysOpen: 1 }
    ]
  },
  {
    name: "Sarah",
    avatar: "https://github.com/sarah.png",
    tasksCount: 4,
    capacity: 45,
    oldestTaskDays: 5,
    recentActivity: "1 hour ago",
    skills: ["UI/UX", "CSS", "Design Systems"],
    currentTasks: [
      { title: "Task Card Redesign", priority: "medium", daysOpen: 5 },
      { title: "Mobile Responsive", priority: "medium", daysOpen: 2 }
    ]
  },
  {
    name: "Mike",
    avatar: "https://github.com/mike.png",
    tasksCount: 9,
    capacity: 85,
    oldestTaskDays: 12,
    recentActivity: "30 minutes ago",
    skills: ["Backend", "Database", "Performance"],
    currentTasks: [
      { title: "API Optimization", priority: "high", daysOpen: 12 },
      { title: "Database Migration", priority: "high", daysOpen: 6 },
      { title: "Caching Implementation", priority: "medium", daysOpen: 4 }
    ]
  },
  {
    name: "Alex",
    avatar: "https://github.com/alex.png",
    tasksCount: 2,
    capacity: 25,
    oldestTaskDays: 2,
    recentActivity: "4 hours ago",
    skills: ["DevOps", "CI/CD", "Monitoring"],
    currentTasks: [
      { title: "Deployment Pipeline", priority: "medium", daysOpen: 2 },
      { title: "Error Monitoring", priority: "low", daysOpen: 1 }
    ]
  }
];

export default function WorkloadPage() {
  const getCapacityColor = (capacity: number) => {
    if (capacity >= 80) return "text-red-600 dark:text-red-400";
    if (capacity >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  const getCapacityIcon = (capacity: number) => {
    if (capacity >= 80) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (capacity >= 60) return <Minus className="h-4 w-4 text-amber-600" />;
    return <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const totalTasks = mockDeveloperWorkloads.reduce((sum, dev) => sum + dev.tasksCount, 0);
  const averageCapacity = Math.round(
    mockDeveloperWorkloads.reduce((sum, dev) => sum + dev.capacity, 0) / mockDeveloperWorkloads.length
  );
  const overdueCount = mockDeveloperWorkloads.reduce(
    (sum, dev) => sum + dev.currentTasks.filter(task => task.daysOpen > 7).length, 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Workload</h1>
          <p className="text-muted-foreground">
            Monitor developer capacity and task distribution
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Real-time
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card data-testid="stat-total-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Across {mockDeveloperWorkloads.length} developers
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-average-capacity">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Capacity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCapacity}%</div>
            <p className="text-xs text-muted-foreground">
              Team utilization
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-overdue-tasks">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              {">"} 7 days old
            </p>
          </CardContent>
        </Card>

        <Card data-testid="stat-completed-today">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">
              Tasks finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Developer Workload Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockDeveloperWorkloads.map((developer) => (
          <Card 
            key={developer.name} 
            className="hover-elevate transition-all duration-200"
            data-testid={`developer-card-${developer.name.toLowerCase()}`}
          >
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={developer.avatar} alt={developer.name} />
                  <AvatarFallback>{developer.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="flex items-center justify-between">
                    <span>{developer.name}</span>
                    <div className="flex items-center space-x-2">
                      {getCapacityIcon(developer.capacity)}
                      <span className={`font-bold ${getCapacityColor(developer.capacity)}`}>
                        {developer.capacity}%
                      </span>
                    </div>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {developer.tasksCount} active tasks • Last active {developer.recentActivity}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Capacity Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Workload Capacity</span>
                  <span className={getCapacityColor(developer.capacity)}>
                    {developer.capacity}%
                  </span>
                </div>
                <Progress 
                  value={developer.capacity} 
                  className="h-2"
                  data-testid={`progress-${developer.name.toLowerCase()}`}
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {developer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Current Tasks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Current Tasks</h4>
                  {developer.oldestTaskDays > 7 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {developer.oldestTaskDays} days old
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {developer.currentTasks.slice(0, 3).map((task, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                      data-testid={`task-${developer.name.toLowerCase()}-${index}`}
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{task.daysOpen}d</span>
                      </div>
                    </div>
                  ))}
                  {developer.currentTasks.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{developer.currentTasks.length - 3} more tasks
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                <div className="text-center">
                  <div className="text-lg font-bold">{developer.tasksCount}</div>
                  <div className="text-xs text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{developer.oldestTaskDays}</div>
                  <div className="text-xs text-muted-foreground">Oldest (days)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Workload Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                High Workload Alert
              </p>
              <p className="text-xs text-red-600 dark:text-red-300">
                Mike is at 85% capacity with tasks over 7 days old. Consider redistributing work.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Capacity Available
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-300">
                Alex has low utilization (25%) and could take on additional tasks.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Balanced Workload
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                Sarah and Christian have optimal task distribution and recent activity.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}