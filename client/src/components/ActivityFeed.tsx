import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, GitBranch, UserCheck, AlertCircle, CheckCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  user?: string;
  timestamp: string;
  type: 'task' | 'decision' | 'assignment' | 'system';
  status?: 'success' | 'warning' | 'info';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  limit?: number;
}

export default function ActivityFeed({ activities, limit = 5 }: ActivityFeedProps) {
  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case 'task':
        return <GitBranch className="h-4 w-4 text-blue-500" />;
      case 'assignment':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'decision':
        return status === 'success' ? 
          <CheckCircle className="h-4 w-4 text-green-500" /> :
          <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (type: string, status?: string) => {
    if (type === 'decision') {
      return (
        <Badge variant={status === 'success' ? 'default' : 'secondary'} className="text-xs">
          {status === 'success' ? 'Approved' : 'Pending'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs capitalize">
        {type}
      </Badge>
    );
  };

  const displayedActivities = activities.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-${activity.id}`}>
                <div className="mt-0.5">
                  {getActivityIcon(activity.type, activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-relaxed">
                    {activity.action}
                    {activity.user && (
                      <span className="font-medium text-foreground ml-1">
                        {activity.user}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    {getStatusBadge(activity.type, activity.status)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}