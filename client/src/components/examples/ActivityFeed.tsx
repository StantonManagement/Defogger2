import ActivityFeed from '../ActivityFeed';

export default function ActivityFeedExample() {
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
      action: 'Decision "Migrate to TypeScript" was',
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
    <div className="p-6 max-w-lg">
      <ActivityFeed activities={mockActivities} />
    </div>
  );
}