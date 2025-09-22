import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { FileText, LayoutGrid } from "lucide-react";

export default function TaskReviewPage() {
  const [view, setView] = useState<"cards" | "table">("cards");

  // Load view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem("task-review-view") as "cards" | "table" | null;
    if (savedView) {
      setView(savedView);
    }
  }, []);

  // Save view preference to localStorage
  const handleViewChange = (newView: string) => {
    if (newView) {
      setView(newView as "cards" | "table");
      localStorage.setItem("task-review-view", newView);
    }
  };

  useEffect(() => {
    console.log("Task Review page complete!");
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Review</h1>
          <p className="text-muted-foreground">Review and approve tasks before pushing to GitHub</p>
        </div>

        {/* View Toggle */}
        <ToggleGroup type="single" value={view} onValueChange={handleViewChange} data-testid="toggle-view">
          <ToggleGroupItem value="cards" data-testid="toggle-cards">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </ToggleGroupItem>
          <ToggleGroupItem value="table" data-testid="toggle-table">
            <FileText className="h-4 w-4 mr-2" />
            Table
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Current View Indicator */}
      <div className="flex items-center gap-2">
        <Badge variant="outline">Current View: {view}</Badge>
        <Badge variant="secondary">Coming Soon: Full Implementation</Badge>
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Task Review Interface</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This will be the new dual-mode Task Review interface with:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Cards view for daily use with budget tracking</li>
            <li>• Table view for power users with sortable columns</li>
            <li>• Multi-select functionality with smart summary bar</li>
            <li>• Payment breakdown calculations</li>
            <li>• GitHub integration for task management</li>
          </ul>
          <div className="mt-4">
            <Button variant="outline" disabled data-testid="button-placeholder">
              Interface Under Development
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}