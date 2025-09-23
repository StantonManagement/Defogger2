import { useState } from "react";
import { ChevronDown, FolderOpen } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed';
}

interface ProjectSelectorProps {
  currentProject?: string;
  onProjectChange: (projectId: string) => void;
}

const projects: Project[] = [
  { id: 'all', name: 'All Projects', status: 'active' },
  { id: 'collections_system', name: 'Collections System', status: 'active' },
  { id: 'property_management', name: 'Property Management', status: 'planning' },
  { id: 'client_work', name: 'Client Projects', status: 'active' },
];

export default function ProjectSelector({ currentProject = 'all', onProjectChange }: ProjectSelectorProps) {
  const selectedProject = projects.find(p => p.id === currentProject) || projects[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'planning': return 'Planning';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-3 py-2 h-auto hover-elevate"
          data-testid="button-project-selector"
        >
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{selectedProject.name}</span>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(selectedProject.status)}`} />
              <span className="text-xs text-muted-foreground">{getStatusText(selectedProject.status)}</span>
            </div>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {projects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            className="flex items-center gap-3 p-3 cursor-pointer"
            onClick={() => onProjectChange(project.id)}
            data-testid={`option-project-${project.id}`}
          >
            <div className="flex items-center gap-2 flex-1">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{project.name}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                  <span className="text-xs text-muted-foreground">{getStatusText(project.status)}</span>
                </div>
              </div>
            </div>
            {project.id === currentProject && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}