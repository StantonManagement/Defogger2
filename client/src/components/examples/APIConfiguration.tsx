import APIConfiguration from '../APIConfiguration';
import { Toaster } from "@/components/ui/toaster";

export default function APIConfigurationExample() {
  return (
    <div className="p-6 max-w-4xl">
      <APIConfiguration />
      <Toaster />
    </div>
  );
}