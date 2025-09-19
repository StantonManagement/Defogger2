import QuickActions from '../QuickActions';
import { Toaster } from "@/components/ui/toaster";

export default function QuickActionsExample() {
  return (
    <div className="p-4 max-w-md">
      <QuickActions />
      <Toaster />
    </div>
  );
}