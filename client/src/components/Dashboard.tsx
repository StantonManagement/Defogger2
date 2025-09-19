import { CheckSquare, Clock, AlertTriangle } from "lucide-react";
import StatCard from "./StatCard";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import ConnectionStatus from "./ConnectionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  // Mock data for demonstration
  const mockActivities = [
    {
      id: '1',
      action: 'Connected to OneDrive successfully',
      timestamp: '2 minutes ago',
      type: 'api' as const
    },
    {
      id: '2',
      action: 'Task "Review documentation" assigned',
      timestamp: '5 minutes ago',
      type: 'task' as const
    },
    {
      id: '3',
      action: 'System cache cleared',
      timestamp: '10 minutes ago',
      type: 'system' as const
    },
    {
      id: '4',
      action: 'GitHub repository connected',
      timestamp: '15 minutes ago',
      type: 'api' as const
    },
    {
      id: '5',
      action: 'New task created: "Update API documentation"',
      timestamp: '20 minutes ago',
      type: 'task' as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your API management and task status
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Tasks Ready" 
          value={12} 
          description="Ready for assignment"
          icon={<CheckSquare className="h-4 w-4" />}
        />
        <StatCard 
          title="Tasks Assigned" 
          value={8} 
          description="Currently in progress"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard 
          title="Pending Decisions" 
          value={3} 
          description="Require attention"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={mockActivities} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ConnectionStatus 
              service="OneDrive" 
              isConnected={true} 
              lastConnection="2 mins ago" 
            />
            <ConnectionStatus 
              service="GitHub" 
              isConnected={false} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}