import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, LayoutGrid, Calendar, DollarSign, User, GitBranch, Eye, AlertCircle, Circle, Flame } from "lucide-react";
import { Task, calculatePaymentBreakdown } from "@shared/schema";

// Mock task data
const mockTasks: Task[] = [
  {
    id: "task-001",
    title: "SMS Agent Setup",
    priority: "high",
    days: 3,
    budget: 2400,
    paymentTerms: "on-complete",
    developer: "Kurt",
    status: "ready",
    description: "Set up SMS capabilities with Twilio integration for automated customer communications...",
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-15T14:20:00Z",
  },
  {
    id: "task-002", 
    title: "Database Migration to PostgreSQL",
    priority: "high",
    days: 5,
    budget: 4500,
    paymentTerms: "50-50",
    developer: "Sarah",
    status: "needs-review",
    description: "Migrate from SQLite to PostgreSQL for better performance and scalability...",
    createdAt: "2024-03-14T09:15:00Z",
    updatedAt: "2024-03-16T11:45:00Z",
  },
  {
    id: "task-003",
    title: "React Query Implementation", 
    priority: "medium",
    days: 4,
    budget: 3200,
    paymentTerms: "25-50-25",
    developer: "Alex",
    status: "ready",
    description: "Replace current data fetching with React Query for better caching and synchronization...",
    createdAt: "2024-03-13T16:20:00Z",
    updatedAt: "2024-03-15T08:30:00Z",
  },
  {
    id: "task-004",
    title: "UI Component Library Upgrade",
    priority: "low", 
    days: 2,
    budget: 1800,
    paymentTerms: "on-complete",
    developer: "Maria",
    status: "ready",
    description: "Update to latest Shadcn UI components and implement new design system...",
    createdAt: "2024-03-12T14:10:00Z",
    updatedAt: "2024-03-14T12:00:00Z",
  },
  {
    id: "task-005",
    title: "API Rate Limiting",
    priority: "medium",
    days: 3,
    budget: 2700,
    paymentTerms: "50-50", 
    developer: "David",
    status: "in-progress",
    description: "Implement rate limiting middleware to prevent API abuse and ensure fair usage...",
    createdAt: "2024-03-11T11:45:00Z",
    updatedAt: "2024-03-16T16:15:00Z",
  },
  {
    id: "task-006",
    title: "Mobile App Performance Optimization",
    priority: "high",
    days: 6,
    budget: 5500,
    paymentTerms: "25-50-25",
    developer: "Kurt",
    status: "needs-review",
    description: "Optimize React Native app performance, reduce bundle size, and improve loading times...",
    createdAt: "2024-03-10T13:30:00Z", 
    updatedAt: "2024-03-15T17:20:00Z",
  },
];

export default function TaskReviewPage() {
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

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

  // Handle task selection
  const handleTaskSelect = (taskId: string, checked: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(mockTasks.map(task => task.id)));
    } else {
      setSelectedTasks(new Set());
    }
  };

  // Get priority color
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return Flame;
      case 'medium': return AlertCircle;
      case 'low': return Circle;
      default: return Circle;
    }
  };

  // Get status color
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'needs-review': return 'text-yellow-600';
      case 'in-progress': return 'text-blue-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  // Format payment terms
  const formatPaymentTerms = (terms: Task['paymentTerms']) => {
    switch (terms) {
      case 'on-complete': return 'On Complete';
      case '50-50': return '50/50';
      case '25-50-25': return '25/50/25';
      default: return terms;
    }
  };

  // Calculate selected totals
  const selectedTasksArray = mockTasks.filter(task => selectedTasks.has(task.id));
  const totalBudget = selectedTasksArray.reduce((sum, task) => sum + task.budget, 0);
  const developerDistribution = selectedTasksArray.reduce((acc, task) => {
    acc[task.developer] = (acc[task.developer] || 0) + task.budget;
    return acc;
  }, {} as Record<string, number>);

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

      {/* Cards View */}
      {view === "cards" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockTasks.map((task) => (
              <Card key={task.id} className="hover-elevate" data-testid={`card-task-${task.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => handleTaskSelect(task.id, !!checked)}
                        data-testid={`checkbox-task-${task.id}`}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold" data-testid={`text-title-${task.id}`}>
                          {task.title}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge 
                      variant={getPriorityColor(task.priority)} 
                      className="capitalize"
                      data-testid={`badge-priority-${task.id}`}
                    >
                      {(() => {
                        const Icon = getPriorityIcon(task.priority);
                        return <Icon className="h-3 w-3 mr-1" />;
                      })()}
                      {task.priority}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Budget and Timeline */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium" data-testid={`text-budget-${task.id}`}>
                        ${task.budget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span data-testid={`text-days-${task.id}`}>{task.days} days</span>
                    </div>
                  </div>

                  {/* Payment and Developer */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Payment</p>
                      <p className="font-medium" data-testid={`text-payment-${task.id}`}>
                        {formatPaymentTerms(task.paymentTerms)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Developer</p>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span data-testid={`text-developer-${task.id}`}>{task.developer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${getStatusColor(task.status)}`}
                      data-testid={`badge-status-${task.id}`}
                    >
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      data-testid={`button-details-${task.id}`}
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                    <Button 
                      size="sm"
                      className="flex items-center gap-2"
                      data-testid={`button-github-${task.id}`}
                    >
                      <GitBranch className="h-3 w-3" />
                      Push to GitHub
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTasks.size === mockTasks.length}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead data-testid="header-task">Task</TableHead>
                    <TableHead data-testid="header-priority">Priority</TableHead>
                    <TableHead data-testid="header-days">Days</TableHead>
                    <TableHead data-testid="header-budget">Budget</TableHead>
                    <TableHead data-testid="header-payment">Payment Terms</TableHead>
                    <TableHead data-testid="header-developer">Developer</TableHead>
                    <TableHead data-testid="header-status">Status</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTasks.map((task) => (
                    <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={(checked) => handleTaskSelect(task.id, !!checked)}
                          data-testid={`checkbox-table-${task.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-table-title-${task.id}`}>
                            {task.title}
                          </div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getPriorityColor(task.priority)}
                          className="capitalize"
                          data-testid={`badge-table-priority-${task.id}`}
                        >
                          {(() => {
                            const Icon = getPriorityIcon(task.priority);
                            return <Icon className="h-3 w-3 mr-1" />;
                          })()}
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-table-days-${task.id}`}>
                        {task.days}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium" data-testid={`text-table-budget-${task.id}`}>
                          ${task.budget.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell data-testid={`text-table-payment-${task.id}`}>
                        {formatPaymentTerms(task.paymentTerms)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span data-testid={`text-table-developer-${task.id}`}>
                            {task.developer}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${getStatusColor(task.status)}`}
                          data-testid={`badge-table-status-${task.id}`}
                        >
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon"
                            data-testid={`button-table-details-${task.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon"
                            data-testid={`button-table-github-${task.id}`}
                          >
                            <GitBranch className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Summary Bar */}
      {selectedTasks.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg" data-testid="summary-bar">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span data-testid="text-selected-count">
                {selectedTasks.size} tasks selected
              </span>
              <span className="text-muted-foreground">|</span>
              <span className="font-medium" data-testid="text-total-budget">
                Total: ${totalBudget.toLocaleString()}
              </span>
              <span className="text-muted-foreground">|</span>
              <div className="flex gap-2" data-testid="developer-distribution">
                {Object.entries(developerDistribution).map(([dev, amount]) => (
                  <span key={dev} className="text-sm">
                    {dev}: ${amount.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-export-csv">
                Export CSV
              </Button>
              <Button variant="outline" size="sm" data-testid="button-archive">
                Archive
              </Button>
              <Button size="sm" data-testid="button-push-selected">
                Push Selected to GitHub
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}