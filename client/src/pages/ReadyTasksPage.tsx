import { useState } from "react";
import TasksTable from "@/components/TasksTable";
import PushTaskModal from "@/components/PushTaskModal";

export default function ReadyTasksPage() {
  const [pushModalOpen, setPushModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Mock data
  const mockTasks = [
    {
      id: 'TASK-001',
      title: 'Implement user authentication system',
      priority: 'high' as const,
      estimatedDays: 5,
      targetDev: 'Kurt Anderson',
      component: 'Auth',
      status: 'ready' as const
    },
    {
      id: 'TASK-002',
      title: 'Add payment processing integration',
      priority: 'medium' as const,
      estimatedDays: 3,
      component: 'Payment',
      status: 'ready' as const
    },
    {
      id: 'TASK-003',
      title: 'Fix mobile responsive layout',
      priority: 'high' as const,
      estimatedDays: 2,
      targetDev: 'Sarah Chen',
      component: 'UI',
      status: 'ready' as const
    },
    {
      id: 'TASK-004',
      title: 'Optimize database queries',
      priority: 'low' as const,
      estimatedDays: 4,
      component: 'Backend',
      status: 'ready' as const
    },
    {
      id: 'TASK-005',
      title: 'Add dark mode support',
      priority: 'medium' as const,
      estimatedDays: 3,
      targetDev: 'Mike Johnson',
      component: 'UI',
      status: 'ready' as const
    },
    {
      id: 'TASK-006',
      title: 'Implement email notifications',
      priority: 'medium' as const,
      estimatedDays: 4,
      component: 'Backend',
      status: 'ready' as const
    },
    {
      id: 'TASK-007',
      title: 'Add unit tests for auth module',
      priority: 'low' as const,
      estimatedDays: 2,
      component: 'Testing',
      status: 'ready' as const
    },
    {
      id: 'TASK-008',
      title: 'Create API documentation',
      priority: 'medium' as const,
      estimatedDays: 3,
      component: 'Documentation',
      status: 'ready' as const
    }
  ];

  const handlePushToGitHub = (taskId: string) => {
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask({
        ...task,
        description: `Implementation task for ${task.title.toLowerCase()}. Priority: ${task.priority}, Estimated: ${task.estimatedDays} days.`
      });
      setPushModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ready Tasks</h1>
        <p className="text-muted-foreground">
          Tasks ready for assignment and GitHub integration
        </p>
      </div>

      {/* Tasks Table */}
      <TasksTable tasks={mockTasks} onPushToGitHub={handlePushToGitHub} />

      {/* Push Task Modal */}
      <PushTaskModal 
        open={pushModalOpen}
        onClose={() => setPushModalOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}