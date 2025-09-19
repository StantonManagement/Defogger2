import SystemSettings from '../SystemSettings';
import { Toaster } from "@/components/ui/toaster";

export default function SystemSettingsExample() {
  return (
    <div className="p-6 max-w-4xl">
      <SystemSettings />
      <Toaster />
    </div>
  );
}