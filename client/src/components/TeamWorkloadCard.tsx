import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  currentLoad: number;
  maxLoad: number;
  tasks: {
    id: string;
    title: string;
    priority: 'high' | 'medium' | 'low';
    daysLeft: number;
  }[];
}

interface TeamWorkloadCardProps {
  member: TeamMember;
}

export default function TeamWorkloadCard({ member }: TeamWorkloadCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const loadPercentage = (member.currentLoad / member.maxLoad) * 100;
  
  const getLoadColor = () => {
    if (loadPercentage >= 90) return 'text-red-600';
    if (loadPercentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getLoadBgColor = () => {
    if (loadPercentage >= 90) return 'bg-red-100 dark:bg-red-900/20';
    if (loadPercentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className={cn("hover-elevate", getLoadBgColor())}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {member.avatar ? (
              <img 
                src={member.avatar} 
                alt={member.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{member.name}</h3>
              <p className={cn("text-sm font-medium", getLoadColor())}>
                {member.currentLoad}/{member.maxLoad} tasks
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            data-testid={`button-expand-${member.id}`}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Capacity</span>
            <span className={getLoadColor()}>{loadPercentage.toFixed(0)}%</span>
          </div>
          <Progress 
            value={loadPercentage} 
            className="h-2"
            data-testid={`progress-${member.id}`}
          />
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Current Tasks</h4>
            {member.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active tasks</p>
            ) : (
              <div className="space-y-2">
                {member.tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-2 rounded-md bg-background border"
                    data-testid={`task-${task.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.daysLeft}d remaining</p>
                    </div>
                    <Badge variant={getPriorityColor(task.priority)} className="text-xs capitalize">
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}