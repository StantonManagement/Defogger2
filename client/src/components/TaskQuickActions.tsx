import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Inbox, 
  CheckSquare, 
  Users, 
  FileText, 
  ArrowRight,
  Plus,
  Search
} from "lucide-react";
import { Link } from "wouter";

export default function TaskQuickActions() {
  const quickActions = [
    {
      title: "Process INBOX Items",
      description: "Review and format new ideas",
      icon: <Inbox className="h-5 w-5" />,
      href: "/tasks?folder=inbox",
      variant: "default" as const,
      badge: "2 new",
      testId: "action-process-inbox"
    },
    {
      title: "Review Ready Tasks", 
      description: "Check tasks ready for assignment",
      icon: <CheckSquare className="h-5 w-5" />,
      href: "/tasks?folder=ready",
      variant: "secondary" as const,
      badge: "3 ready",
      testId: "action-review-ready"
    },
    {
      title: "Check Team Workload",
      description: "Monitor developer capacity",
      icon: <Users className="h-5 w-5" />,
      href: "/workload",
      variant: "secondary" as const,
      badge: "7 active",
      testId: "action-check-workload"
    },
    {
      title: "View Workflow Guide",
      description: "Read process documentation",
      icon: <FileText className="h-5 w-5" />,
      href: "/workflow",
      variant: "outline" as const,
      badge: null,
      testId: "action-view-guide"
    }
  ];

  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Quick Actions</span>
          <Badge variant="secondary" className="text-xs">
            Workflow Tools
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Button 
                variant={action.variant}
                className="w-full justify-start h-auto p-4 hover-elevate"
                data-testid={action.testId}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {action.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-sm">
                        {action.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {action.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {action.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Button>
            </Link>
          ))}
        </div>

        {/* Additional Quick Tools */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
            Quick Tools
          </h4>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}