import Navigation from '../Navigation';
import { Toaster } from "@/components/ui/toaster";

export default function NavigationExample() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6">
        <h1 className="text-2xl font-bold">Navigation Example</h1>
        <p className="text-muted-foreground mt-2">
          This shows the navigation component with theme toggle and search functionality.
        </p>
      </div>
      <Toaster />
    </div>
  );
}