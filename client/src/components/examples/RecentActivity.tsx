import RecentActivity from '../RecentActivity';

export default function RecentActivityExample() {
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
    }
  ];

  return (
    <div className="p-4 max-w-md">
      <RecentActivity activities={mockActivities} />
    </div>
  );
}