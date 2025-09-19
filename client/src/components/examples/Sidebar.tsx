import Sidebar from '../Sidebar';

export default function SidebarExample() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Sidebar Example</h1>
        <p className="text-muted-foreground mt-2">
          This shows the collapsible sidebar navigation with active states.
        </p>
      </div>
    </div>
  );
}