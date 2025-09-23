import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Eye, GitBranch, Archive, DollarSign, Check, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDays: number;
  targetDev?: string;
  component: string;
  status: 'ready' | 'assigned' | 'in-progress';
  paymentStatus?: 'pending' | 'confirmed' | 'sent';
  budget?: number;
}

interface TasksTableProps {
  tasks: Task[];
  showActions?: boolean;
  onPushToGitHub?: (taskId: string) => void;
  onPaymentStatusChange?: (taskId: string, status: 'pending' | 'confirmed' | 'sent') => void;
}

export default function TasksTable({ tasks, showActions = true, onPushToGitHub, onPaymentStatusChange }: TasksTableProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');
  const { toast } = useToast();

  // Get unique components for filter
  const components = Array.from(new Set(tasks.map(task => task.component)));

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.component.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesComponent = componentFilter === 'all' || task.component === componentFilter;
    
    return matchesSearch && matchesPriority && matchesComponent;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'default'; // Green
      case 'sent': return 'secondary'; // Yellow
      case 'pending':
      default: return 'destructive'; // Red
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return <Check className="h-3 w-3" />;
      case 'sent': return <Clock className="h-3 w-3" />;
      case 'pending':
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getNextPaymentStatus = (status?: string): 'pending' | 'sent' | 'confirmed' => {
    switch (status) {
      case 'pending': return 'sent';
      case 'sent': return 'confirmed';
      case 'confirmed': return 'pending';
      default: return 'sent';
    }
  };

  const handlePaymentStatusToggle = (taskId: string, currentStatus?: string) => {
    const newStatus = getNextPaymentStatus(currentStatus);
    if (onPaymentStatusChange) {
      onPaymentStatusChange(taskId, newStatus);
    }
    toast({
      title: "Payment Status Updated",
      description: `Payment status changed to ${newStatus}`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks(prev => [...prev, taskId]);
    } else {
      setSelectedTasks(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleBulkArchive = () => {
    toast({
      title: "Tasks Archived",
      description: `${selectedTasks.length} tasks have been archived`,
    });
    setSelectedTasks([]);
  };

  const handleViewDetails = (taskId: string) => {
    toast({
      title: "View Details",
      description: `Opening details for task ${taskId}`,
    });
  };

  const handlePushToGitHub = (taskId: string) => {
    if (onPushToGitHub) {
      onPushToGitHub(taskId);
    } else {
      toast({
        title: "Push to GitHub",
        description: `Creating GitHub issue for task ${taskId}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ready Tasks</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-tasks"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={componentFilter} onValueChange={setComponentFilter}>
              <SelectTrigger className="w-32" data-testid="select-component-filter">
                <SelectValue placeholder="Component" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                {components.map(component => (
                  <SelectItem key={component} value={component}>{component}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedTasks.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBulkArchive}
                className="flex items-center gap-2"
                data-testid="button-bulk-archive"
              >
                <Archive className="h-4 w-4" />
                Archive ({selectedTasks.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">
                  <Checkbox
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </th>
                <th className="text-left p-2 font-medium">Task Title</th>
                <th className="text-left p-2 font-medium">Priority</th>
                <th className="text-left p-2 font-medium">Est. Days</th>
                <th className="text-left p-2 font-medium">Component</th>
                <th className="text-left p-2 font-medium">Target Dev</th>
                <th className="text-left p-2 font-medium">Payment Status</th>
                {showActions && <th className="text-left p-2 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/50" data-testid={`task-row-${task.id}`}>
                  <td className="p-2">
                    <Checkbox
                      checked={selectedTasks.includes(task.id)}
                      onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                      data-testid={`checkbox-task-${task.id}`}
                    />
                  </td>
                  <td className="p-2 font-medium">{task.title}</td>
                  <td className="p-2">
                    <Badge variant={getPriorityColor(task.priority)} className="capitalize">
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="p-2 text-muted-foreground">{task.estimatedDays}d</td>
                  <td className="p-2 text-sm">{task.component}</td>
                  <td className="p-2 text-sm">
                    {task.targetDev ? (
                      <span className="font-medium">{task.targetDev}</span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePaymentStatusToggle(task.id, task.paymentStatus)}
                      className="h-8 px-2 hover-elevate"
                      data-testid={`button-payment-status-${task.id}`}
                    >
                      <Badge 
                        variant={getPaymentStatusColor(task.paymentStatus)}
                        className="flex items-center gap-1 cursor-pointer"
                      >
                        {getPaymentStatusIcon(task.paymentStatus)}
                        <span className="text-xs">
                          {task.paymentStatus === 'confirmed' ? 'Paid' : 
                           task.paymentStatus === 'sent' ? 'Sent' : 'Pending'}
                        </span>
                      </Badge>
                    </Button>
                  </td>
                  {showActions && (
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(task.id)}
                          data-testid={`button-view-${task.id}`}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePushToGitHub(task.id)}
                          data-testid={`button-push-${task.id}`}
                        >
                          <GitBranch className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No tasks found matching your criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}