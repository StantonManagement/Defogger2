import { useState } from "react";
import PushTaskModal from '../PushTaskModal';
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

export default function PushTaskModalExample() {
  const [modalOpen, setModalOpen] = useState(false);
  
  const mockTask = {
    id: 'TASK-001',
    title: 'Implement user authentication system',
    description: 'Create a secure authentication system with login, registration, and password reset functionality. Include JWT token handling and session management.',
    priority: 'high' as const,
    component: 'Auth'
  };

  return (
    <div className="p-6">
      <Button onClick={() => setModalOpen(true)}>
        Open Push Task Modal
      </Button>
      
      <PushTaskModal 
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={mockTask}
      />
      
      <Toaster />
    </div>
  );
}