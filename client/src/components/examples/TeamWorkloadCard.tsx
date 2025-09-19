import TeamWorkloadCard from '../TeamWorkloadCard';

export default function TeamWorkloadCardExample() {
  const mockMembers = [
    {
      id: 'dev-1',
      name: 'Kurt Anderson',
      currentLoad: 4,
      maxLoad: 5,
      tasks: [
        { id: 'T-001', title: 'User authentication system', priority: 'high' as const, daysLeft: 3 },
        { id: 'T-002', title: 'API documentation', priority: 'medium' as const, daysLeft: 7 },
        { id: 'T-003', title: 'Database migration', priority: 'low' as const, daysLeft: 14 },
        { id: 'T-004', title: 'Bug fixes', priority: 'high' as const, daysLeft: 2 }
      ]
    },
    {
      id: 'dev-2',
      name: 'Sarah Chen',
      currentLoad: 2,
      maxLoad: 5,
      tasks: [
        { id: 'T-005', title: 'Mobile responsive design', priority: 'high' as const, daysLeft: 5 },
        { id: 'T-006', title: 'Performance optimization', priority: 'medium' as const, daysLeft: 10 }
      ]
    },
    {
      id: 'dev-3',
      name: 'Mike Johnson',
      currentLoad: 5,
      maxLoad: 5,
      tasks: [
        { id: 'T-007', title: 'Dark mode implementation', priority: 'medium' as const, daysLeft: 4 },
        { id: 'T-008', title: 'Email service integration', priority: 'high' as const, daysLeft: 6 },
        { id: 'T-009', title: 'Testing framework setup', priority: 'low' as const, daysLeft: 12 },
        { id: 'T-010', title: 'Code review', priority: 'medium' as const, daysLeft: 1 },
        { id: 'T-011', title: 'Security audit', priority: 'high' as const, daysLeft: 8 }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {mockMembers.map(member => (
        <TeamWorkloadCard key={member.id} member={member} />
      ))}
    </div>
  );
}