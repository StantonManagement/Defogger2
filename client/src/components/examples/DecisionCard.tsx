import DecisionCard from '../DecisionCard';
import { Toaster } from "@/components/ui/toaster";

export default function DecisionCardExample() {
  const mockDecisions = [
    {
      id: 'DEC-001',
      title: 'Migrate to TypeScript',
      description: 'Convert entire frontend codebase from JavaScript to TypeScript for better type safety and developer experience.',
      cost: 15000,
      timeEstimate: '3-4 weeks',
      priority: 'high' as const,
      businessCase: 'Improved code quality, reduced bugs in production, better IDE support, and easier onboarding for new developers. Expected 20% reduction in runtime errors.',
      submittedBy: 'Sarah Chen',
      submittedAt: '2 hours ago',
      status: 'pending' as const
    },
    {
      id: 'DEC-002',
      title: 'Implement React Query',
      description: 'Replace current data fetching approach with React Query for better caching and synchronization.',
      timeEstimate: '1-2 weeks',
      priority: 'medium' as const,
      businessCase: 'Better user experience with optimistic updates, automatic background refetching, and reduced loading states. Performance improvement expected.',
      submittedBy: 'Kurt Anderson',
      submittedAt: '1 day ago',
      status: 'approved' as const
    },
    {
      id: 'DEC-003',
      title: 'Add premium subscription tier',
      description: 'Introduce paid plans with advanced features for power users.',
      cost: 25000,
      timeEstimate: '6-8 weeks',
      priority: 'low' as const,
      businessCase: 'New revenue stream targeting enterprise customers. Market research shows 15% of users willing to pay for premium features.',
      submittedBy: 'Mike Johnson',
      submittedAt: '3 days ago',
      status: 'rejected' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {mockDecisions.map(decision => (
        <DecisionCard key={decision.id} decision={decision} />
      ))}
      <Toaster />
    </div>
  );
}