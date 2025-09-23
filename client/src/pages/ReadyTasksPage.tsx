import { useState, useEffect } from "react";
import TasksTable from "@/components/TasksTable";
import PushTaskModal from "@/components/PushTaskModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ReadyTasksPage() {
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [localTasks, setLocalTasks] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch real mock tasks from API
  const { data: tasksData, isLoading, error } = useQuery({
    queryKey: ['/api/mock-tasks'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback mock data (aligned with collections_system components)
  const fallbackTasks = [
    {
      id: 'T-001',
      title: 'API Framework Core Module',
      priority: 'high' as const,
      estimatedDays: 5,
      targetDev: 'Paul Limbo',
      assignedTo: 'Paul Limbo',
      component: 'api_framework',
      status: 'ready' as const,
      paymentStatus: 'pending' as const,
      budget: 2400,
      project: 'collections_system'
    },
    {
      id: 'T-002',
      title: 'Task Queue Processing System',
      priority: 'high' as const,
      estimatedDays: 6,
      targetDev: 'Jose Enrico Maxino',
      assignedTo: 'Jose Enrico Maxino',
      component: 'task_queue',
      status: 'ready' as const,
      paymentStatus: 'sent' as const,
      budget: 2880,
      project: 'collections_system'
    },
    {
      id: 'T-003',
      title: 'Event Bus Communication Layer',
      priority: 'medium' as const,
      estimatedDays: 4,
      targetDev: 'Christian Sumoba',
      assignedTo: 'Christian Sumoba',
      component: 'event_bus',
      status: 'ready' as const,
      paymentStatus: 'confirmed' as const,
      budget: 1920,
      project: 'collections_system'
    },
    {
      id: 'T-004',
      title: 'Notification Service Integration',
      priority: 'medium' as const,
      estimatedDays: 5,
      targetDev: 'Cedrick Barzaga',
      assignedTo: 'Cedrick Barzaga',
      component: 'notifications',
      status: 'ready' as const,
      paymentStatus: 'pending' as const,
      budget: 2400,
      project: 'collections_system'
    },
    {
      id: 'T-005',
      title: 'Document Processing Pipeline',
      priority: 'high' as const,
      estimatedDays: 7,
      targetDev: 'Gabriel Jerdhy Lapuz',
      assignedTo: 'Gabriel Jerdhy Lapuz',
      component: 'documents',
      status: 'ready' as const,
      paymentStatus: 'sent' as const,
      budget: 3360,
      project: 'collections_system'
    },
    {
      id: 'T-006',
      title: 'SMS Agent Communication Module',
      priority: 'medium' as const,
      estimatedDays: 4,
      targetDev: 'Kurt',
      assignedTo: 'Kurt',
      component: 'sms_agent',
      status: 'ready' as const,
      paymentStatus: 'confirmed' as const,
      budget: 1920,
      project: 'collections_system'
    }
  ];

  // Use real data if available, otherwise fall back to local mock data
  const initialTasks = (tasksData as any)?.success ? (tasksData as any).data : fallbackTasks;
  
  // Initialize local tasks state when data changes
  useEffect(() => {
    setLocalTasks(initialTasks);
  }, [JSON.stringify(initialTasks)]);
  
  const tasks = localTasks.length > 0 ? localTasks : initialTasks;

  const handlePushToGitHub = (taskId: string) => {
    const task = tasks.find((t: any) => t.id === taskId);
    if (task) {
      setSelectedTask({
        ...task,
        description: `Implementation task for ${task.title.toLowerCase()}. Priority: ${task.priority}, Estimated: ${task.estimatedDays} days.`
      });
      setPushModalOpen(true);
    }
  };

  const handlePaymentStatusChange = (taskId: string, newStatus: 'pending' | 'sent' | 'confirmed') => {
    // Find the task before updating state
    const taskToUpdate = tasks.find((t: any) => t.id === taskId);
    
    // Update local state
    setLocalTasks(prevTasks => {
      return prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, paymentStatus: newStatus }
          : task
      );
    });
    
    // Show single toast notification
    if (taskToUpdate) {
      toast({
        title: "Payment Status Updated",
        description: `${taskToUpdate.title} payment status changed to ${newStatus}`,
      });
    }
    
    // TODO: Implement API call to update payment status in database
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ready Tasks</h1>
        <p className="text-muted-foreground">
          Tasks ready for assignment and GitHub integration
        </p>
        
        {/* Data source indicator */}
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
            OneDrive: Using Demo Data (MFA pending)
          </Badge>
          {(tasksData as any)?.success ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              Live API Data
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
              Mock Data
            </Badge>
          )}
        </div>
        
        {error && (
          <div className="mt-2 flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800 dark:text-red-200">
              API Error: {(error as any).message} - Using fallback data
            </span>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading tasks...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TasksTable 
          tasks={tasks} 
          onPushToGitHub={handlePushToGitHub}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      )}

      {/* Push Task Modal */}
      <PushTaskModal 
        open={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}