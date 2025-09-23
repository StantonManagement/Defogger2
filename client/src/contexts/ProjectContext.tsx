import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectContextType {
  currentProject: string;
  setCurrentProject: (projectId: string) => void;
  projects: Array<{
    id: string;
    name: string;
    status: 'active' | 'planning' | 'completed';
  }>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const projects = [
  { id: 'all', name: 'All Projects', status: 'active' as const },
  { id: 'collections_system', name: 'Collections System', status: 'active' as const },
  { id: 'property_management', name: 'Property Management', status: 'planning' as const },
  { id: 'client_work', name: 'Client Projects', status: 'active' as const },
];

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [currentProject, setCurrentProjectState] = useState('collections_system');
  const queryClient = useQueryClient();

  // Load project from localStorage on mount
  useEffect(() => {
    const savedProject = localStorage.getItem('currentProject');
    if (savedProject && projects.some(p => p.id === savedProject)) {
      setCurrentProjectState(savedProject);
    }
  }, []);

  const setCurrentProject = (projectId: string) => {
    setCurrentProjectState(projectId);
    localStorage.setItem('currentProject', projectId);
    
    // Invalidate all queries that might be affected by project changes
    queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
    queryClient.invalidateQueries({ queryKey: ['/api/workload'] });
    queryClient.invalidateQueries({ queryKey: ['/api/team'] });
    queryClient.invalidateQueries({ queryKey: ['/api/developers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/projects/stats'] });
    
    console.log('Project changed to:', projectId);
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        currentProject, 
        setCurrentProject, 
        projects 
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// Helper hook for creating project-aware query keys
export function useProjectQuery() {
  const { currentProject } = useProject();
  
  const getQueryKey = (baseKey: string, additionalParams?: Record<string, any>) => {
    if (currentProject === 'all') {
      return [baseKey, additionalParams].filter(Boolean);
    }
    return [baseKey, { project: currentProject, ...additionalParams }];
  };
  
  return { getQueryKey, currentProject };
}