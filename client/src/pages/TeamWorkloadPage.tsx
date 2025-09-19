import TeamWorkloadCard from "@/components/TeamWorkloadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TeamWorkloadPage() {
  const { toast } = useToast();
  
  // Mock data
  const mockTeam = [
    {
      id: 'dev-1',
      name: 'Kurt Anderson',
      currentLoad: 4,
      maxLoad: 5,
      tasks: [
        { id: 'T-001', title: 'User authentication system', priority: 'high' as const, daysLeft: 3 },
        { id: 'T-002', title: 'API documentation', priority: 'medium' as const, daysLeft: 7 },
        { id: 'T-003', title: 'Database migration', priority: 'low' as const, daysLeft: 14 },
        { id: 'T-004', title: 'Bug fixes', priority: 'high' as const, daysLeft: 2 }
      ]
    },
    {
      id: 'dev-2',
      name: 'Sarah Chen',
      currentLoad: 2,
      maxLoad: 5,
      tasks: [
        { id: 'T-005', title: 'Mobile responsive design', priority: 'high' as const, daysLeft: 5 },
        { id: 'T-006', title: 'Performance optimization', priority: 'medium' as const, daysLeft: 10 }
      ]
    },
    {
      id: 'dev-3',
      name: 'Mike Johnson',
      currentLoad: 5,
      maxLoad: 5,
      tasks: [
        { id: 'T-007', title: 'Dark mode implementation', priority: 'medium' as const, daysLeft: 4 },
        { id: 'T-008', title: 'Email service integration', priority: 'high' as const, daysLeft: 6 },
        { id: 'T-009', title: 'Testing framework setup', priority: 'low' as const, daysLeft: 12 },
        { id: 'T-010', title: 'Code review', priority: 'medium' as const, daysLeft: 1 },
        { id: 'T-011', title: 'Security audit', priority: 'high' as const, daysLeft: 8 }
      ]
    },
    {
      id: 'dev-4',
      name: 'Alex Rodriguez',
      currentLoad: 1,
      maxLoad: 4,
      tasks: [
        { id: 'T-012', title: 'Database optimization', priority: 'low' as const, daysLeft: 15 }
      ]
    }
  ];

  // Calculate summary stats
  const totalTasks = mockTeam.reduce((sum, member) => sum + member.currentLoad, 0);
  const totalCapacity = mockTeam.reduce((sum, member) => sum + member.maxLoad, 0);
  const availableCapacity = totalCapacity - totalTasks;
  const averagePerDev = totalTasks / mockTeam.length;

  const handleSuggestAssignment = () => {
    toast({
      title: "Assignment Suggestion",
      description: "Recommend assigning next high-priority task to Sarah Chen (lowest current load)",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team Workload</h1>
        <p className="text-muted-foreground">
          Monitor team capacity and distribute tasks efficiently
        </p>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Overview
            </span>
            <Button 
              variant="outline" 
              onClick={handleSuggestAssignment}
              className="flex items-center gap-2"
              data-testid="button-suggest-assignment"
            >
              <Lightbulb className="h-4 w-4" />
              Suggest Assignment
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{totalTasks}</span>
              <span className="text-muted-foreground">Total tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{availableCapacity}</span>
              <span className="text-muted-foreground">Available capacity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{averagePerDev.toFixed(1)}</span>
              <span className="text-muted-foreground">Avg per developer</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {mockTeam.filter(m => m.currentLoad / m.maxLoad >= 0.9).length} overloaded
              </Badge>
              <Badge variant="outline" className="text-sm">
                {mockTeam.filter(m => m.currentLoad / m.maxLoad <= 0.4).length} available
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockTeam.map(member => (
          <TeamWorkloadCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}