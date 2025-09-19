import StatCard from '../StatCard';
import { CheckSquare } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <StatCard 
        title="Tasks Ready" 
        value={12} 
        description="Ready for assignment"
        icon={<CheckSquare className="h-4 w-4" />}
      />
      <StatCard 
        title="Tasks Assigned" 
        value={8} 
        description="Currently in progress"
      />
      <StatCard 
        title="Pending Decisions" 
        value={3} 
        description="Require attention"
      />
    </div>
  );
}