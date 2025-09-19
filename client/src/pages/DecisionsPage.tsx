import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DecisionCard from "@/components/DecisionCard";
import { Badge } from "@/components/ui/badge";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState([
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
      status: 'pending' as const
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
      status: 'pending' as const
    },
    {
      id: 'DEC-004',
      title: 'Upgrade to Node.js 20',
      description: 'Update backend infrastructure to use the latest LTS version of Node.js.',
      timeEstimate: '1 week',
      priority: 'medium' as const,
      businessCase: 'Performance improvements, better security features, and access to latest JavaScript features. Minimal risk with good long-term benefits.',
      submittedBy: 'Alex Rodriguez',
      submittedAt: '1 week ago',
      status: 'approved' as const
    },
    {
      id: 'DEC-005',
      title: 'Rewrite in Rust',
      description: 'Complete rewrite of backend services in Rust for performance.',
      cost: 100000,
      timeEstimate: '6 months',
      priority: 'low' as const,
      businessCase: 'Significant performance gains and memory safety. However, requires extensive team training and carries high risk.',
      submittedBy: 'Mike Johnson',
      submittedAt: '2 weeks ago',
      status: 'rejected' as const
    }
  ]);

  const handleApprove = (id: string) => {
    setDecisions(prev => 
      prev.map(decision => 
        decision.id === id ? { ...decision, status: 'approved' as const } : decision
      )
    );
  };

  const handleReject = (id: string) => {
    setDecisions(prev => 
      prev.map(decision => 
        decision.id === id ? { ...decision, status: 'rejected' as const } : decision
      )
    );
  };

  const pendingDecisions = decisions.filter(d => d.status === 'pending');
  const historicalDecisions = decisions.filter(d => d.status !== 'pending');

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decisions</h1>
        <p className="text-muted-foreground">
          Review and approve development decisions and proposals
        </p>
      </div>

      {/* Decision Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            Pending
            {pendingDecisions.length > 0 && (
              <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pendingDecisions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingDecisions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending decisions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingDecisions.map(decision => (
                <DecisionCard 
                  key={decision.id} 
                  decision={decision}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          {historicalDecisions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No historical decisions</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {historicalDecisions.map(decision => (
                <DecisionCard 
                  key={decision.id} 
                  decision={decision}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}