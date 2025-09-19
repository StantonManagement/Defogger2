import Header from '../Header';

export default function HeaderExample() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <h1 className="text-2xl font-bold">Header Example</h1>
        <p className="text-muted-foreground mt-2">
          This shows the header component with search, notifications, and theme toggle.
        </p>
      </div>
    </div>
  );
}