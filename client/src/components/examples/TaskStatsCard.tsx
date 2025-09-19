import TaskStatsCard from '../TaskStatsCard';
import { CheckSquare, Clock, AlertTriangle, Users } from 'lucide-react';

export default function TaskStatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
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
  );
}