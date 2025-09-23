import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import DashboardPage from "@/pages/DashboardPage";
import WorkflowPage from "@/pages/WorkflowPage";
import TasksPage from "@/pages/TasksPage";
import WorkloadPage from "@/pages/WorkloadPage";
import ReadyTasksPage from "@/pages/ReadyTasksPage";
import TeamWorkloadPage from "@/pages/TeamWorkloadPage";
import TaskReviewPage from "@/pages/TaskReviewPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/workflow" component={WorkflowPage} />
      <Route path="/tasks" component={TasksPage} />
      <Route path="/workload" component={WorkloadPage} />
      <Route path="/ready-tasks" component={ReadyTasksPage} />
      <Route path="/team-workload" component={TeamWorkloadPage} />
      <Route path="/task-review" component={TaskReviewPage} />
      <Route path="/decisions">
        <Redirect to="/task-review" />
      </Route>
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
