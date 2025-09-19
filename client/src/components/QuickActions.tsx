import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Download, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuickActions() {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    console.log(`${action} triggered`);
    toast({
      title: "Action Triggered",
      description: `${action} has been initiated`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => handleAction('Create New Task')}
            data-testid="button-new-task"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => handleAction('Refresh Data')}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => handleAction('Export CSV')}
            data-testid="button-export"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 h-12"
            onClick={() => handleAction('Search Files')}
            data-testid="button-search"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}