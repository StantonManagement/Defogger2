import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, CheckSquare, Rocket, Archive, ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";

interface WorkflowStats {
  inbox: number;
  ready: number;
  assigned: number;
  archived: number;
}

interface TaskWorkflowStatsProps {
  stats: WorkflowStats;
}

export default function TaskWorkflowStats({ stats }: TaskWorkflowStatsProps) {
  const statCards = [
    {
      title: "INBOX",
      value: stats.inbox,
      subtitle: "items",
      icon: <Inbox className="h-5 w-5" />,
      className: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
      trend: "up",
      trendValue: "+2 today",
      bgClass: "bg-blue-500",
      testId: "stat-inbox"
    },
    {
      title: "READY",
      value: stats.ready,
      subtitle: "tasks",
      icon: <CheckSquare className="h-5 w-5" />,
      className: "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300",
      trend: "neutral",
      trendValue: "stable",
      bgClass: "bg-green-500",
      testId: "stat-ready"
    },
    {
      title: "ASSIGNED",
      value: stats.assigned,
      subtitle: "active",
      icon: <Rocket className="h-5 w-5" />,
      className: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
      trend: "up",
      trendValue: "+3 today",
      bgClass: "bg-amber-500",
      testId: "stat-assigned"
    },
    {
      title: "ARCHIVED",
      value: stats.archived,
      subtitle: "total",
      icon: <Archive className="h-5 w-5" />,
      className: "bg-gray-500/10 border-gray-500/20 text-gray-700 dark:text-gray-300",
      trend: "down",
      trendValue: "-1 today",
      bgClass: "bg-gray-500",
      testId: "stat-archived"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpIcon className="h-3 w-3 text-green-600" />;
      case "down":
        return <ArrowDownIcon className="h-3 w-3 text-red-600" />;
      default:
        return <MinusIcon className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => (
        <Card 
          key={card.title} 
          className={`${card.className} border-2 hover-elevate transition-all duration-200`}
          data-testid={card.testId}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold tracking-wider">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${card.bgClass}/20`}>
              {card.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <div className="text-3xl font-bold">{card.value}</div>
                <div className="text-sm text-muted-foreground">{card.subtitle}</div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                {getTrendIcon(card.trend)}
                <span className="font-medium">{card.trendValue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}