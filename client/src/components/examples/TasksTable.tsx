import TasksTable from '../TasksTable';
import { Toaster } from "@/components/ui/toaster";

export default function TasksTableExample() {
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
    }
  ];

  return (
    <div className="p-6">
      <TasksTable tasks={mockTasks} />
      <Toaster />
    </div>
  );
}