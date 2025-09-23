import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Inbox, CheckSquare, Rocket, Archive } from "lucide-react";

interface WorkflowStats {
  inbox: number;
  ready: number;
  assigned: number;
  archived: number;
}

interface WorkflowVisualizationProps {
  stats: WorkflowStats;
}

export default function WorkflowVisualization({ stats }: WorkflowVisualizationProps) {
  const stages = [
    {
      name: "INBOX",
      count: stats.inbox,
      icon: <Inbox className="h-5 w-5" />,
      color: "blue",
      description: "Raw ideas and requests",
      bgClass: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300"
    },
    {
      name: "READY",
      count: stats.ready,
      icon: <CheckSquare className="h-5 w-5" />,
      color: "green",
      description: "Formatted and ready for assignment",
      bgClass: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300"
    },
    {
      name: "ASSIGNED",
      count: stats.assigned,
      icon: <Rocket className="h-5 w-5" />,
      color: "amber",
      description: "Active development tasks",
      bgClass: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
    },
    {
      name: "ARCHIVE",
      count: stats.archived,
      icon: <Archive className="h-5 w-5" />,
      color: "gray",
      description: "Completed and stored",
      bgClass: "bg-gray-500/10 border-gray-500/20 text-gray-700 dark:text-gray-300"
    }
  ];

  return (
    <Card className="w-full" data-testid="workflow-visualization">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Workflow Pipeline</span>
          <Badge variant="secondary" className="text-xs">
            {stats.inbox + stats.ready + stats.assigned} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4 overflow-x-auto pb-4">
          {stages.map((stage, index) => (
            <div key={stage.name} className="flex items-center space-x-4 min-w-0">
              {/* Stage Box */}
              <div 
                className={`
                  ${stage.bgClass} 
                  border-2 rounded-lg p-4 text-center min-w-[120px] 
                  hover-elevate transition-all duration-200
                `}
                data-testid={`workflow-stage-${stage.name.toLowerCase()}`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    {stage.icon}
                    <span className="font-bold text-sm">{stage.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <p className="text-xs text-muted-foreground text-center">
                    {stage.description}
                  </p>
                </div>
              </div>

              {/* Arrow between stages */}
              {index < stages.length - 1 && (
                <div className="flex items-center justify-center min-w-[40px]">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Workflow Description */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Task Flow Process</h4>
          <p className="text-sm text-muted-foreground">
            Ideas start in the <strong>INBOX</strong>, get formatted and organized into <strong>READY</strong> tasks, 
            then get <strong>ASSIGNED</strong> to developers and pushed to GitHub, finally moving to the <strong>ARCHIVE</strong> when completed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}