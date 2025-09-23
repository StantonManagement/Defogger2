import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertTriangle, User, Calendar, Filter } from "lucide-react";

interface QuickFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  showProjectFilter?: boolean;
}

export interface FilterState {
  status: string[];
  priority: string[];
  project: string[];
  assignee: string[];
  dueDate: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'In Progress', icon: AlertTriangle, color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'blocked', label: 'Blocked', icon: AlertTriangle, color: 'bg-red-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
];

const projectOptions = [
  { value: 'collections_system', label: 'Collections System' },
  { value: 'property_management', label: 'Property Management' },
  { value: 'client_work', label: 'Client Projects' },
];

const dueDateOptions = [
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'next_week', label: 'Next Week' },
];

export default function QuickFilters({ 
  onFilterChange, 
  initialFilters = { status: [], priority: [], project: [], assignee: [], dueDate: '' },
  showProjectFilter = true 
}: QuickFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const updateFilter = (category: keyof FilterState, value: string) => {
    let newFilters: FilterState;
    
    if (category === 'dueDate') {
      newFilters = {
        ...filters,
        [category]: filters.dueDate === value ? '' : value
      };
    } else {
      const currentValues = filters[category] as string[];
      const isSelected = currentValues.includes(value);
      newFilters = {
        ...filters,
        [category]: isSelected 
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value]
      };
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = { status: [], priority: [], project: [], assignee: [], dueDate: '' };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const getActiveFilterCount = () => {
    return filters.status.length + 
           filters.priority.length + 
           filters.project.length + 
           filters.assignee.length + 
           (filters.dueDate ? 1 : 0);
  };

  const isFilterActive = (category: keyof FilterState, value: string): boolean => {
    if (category === 'dueDate') {
      return filters.dueDate === value;
    }
    return (filters[category] as string[]).includes(value);
  };

  return (
    <div className="space-y-4" data-testid="quick-filters">
      {/* Quick Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Status:</span>
        </div>
        {statusOptions.map(({ value, label, icon: Icon, color }) => (
          <Button
            key={value}
            variant={isFilterActive('status', value) ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => updateFilter('status', value)}
            data-testid={`filter-status-${value}`}
          >
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <Icon className="h-3 w-3" />
            {label}
          </Button>
        ))}
      </div>

      {/* Expandable Additional Filters */}
      {showAllFilters && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
          {/* Priority Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium mr-2">Priority:</span>
            {priorityOptions.map(({ value, label, color }) => (
              <Button
                key={value}
                variant={isFilterActive('priority', value) ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => updateFilter('priority', value)}
                data-testid={`filter-priority-${value}`}
              >
                <div className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </Button>
            ))}
          </div>

          {/* Project Filters */}
          {showProjectFilter && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium mr-2">Project:</span>
              {projectOptions.map(({ value, label }) => (
                <Button
                  key={value}
                  variant={isFilterActive('project', value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('project', value)}
                  data-testid={`filter-project-${value}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          {/* Due Date Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Due Date:</span>
            {dueDateOptions.map(({ value, label }) => (
              <Button
                key={value}
                variant={isFilterActive('dueDate', value) ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('dueDate', value)}
                data-testid={`filter-due-${value}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllFilters(!showAllFilters)}
            data-testid="button-toggle-filters"
          >
            {showAllFilters ? 'Less Filters' : 'More Filters'}
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Badge variant="secondary" data-testid="badge-active-filters">
              {getActiveFilterCount()} active filter{getActiveFilterCount() !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {getActiveFilterCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            data-testid="button-clear-filters"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}