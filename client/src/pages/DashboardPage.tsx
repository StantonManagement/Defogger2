import { CheckSquare, Clock, AlertTriangle, Users } from "lucide-react";
import TaskStatsCard from "@/components/TaskStatsCard";
import ActivityFeed from "@/components/ActivityFeed";
import QuickActions from "@/components/QuickActions";

export default function DashboardPage() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your development team's task flow and productivity
        </p>
      </div>

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