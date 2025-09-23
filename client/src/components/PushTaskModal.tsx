import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, GitBranch, User, Tag, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

interface PushTaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    component: string;
  };
}

// Fallback developers for when GitHub API is not available
const fallbackDevelopers = [
  { login: 'kurt', name: 'Kurt', load: 0, maxLoad: 5 },
  { login: 'jose', name: 'Jose Enrico Maxino', load: 1, maxLoad: 5 },
  { login: 'christian', name: 'Christian Sumoba', load: 1, maxLoad: 5 },
  { login: 'cedrick', name: 'Cedrick Barzaga', load: 1, maxLoad: 5 },
  { login: 'gabriel', name: 'Gabriel Jerdhy Lapuz', load: 1, maxLoad: 5 },
  { login: 'paul', name: 'Paul Limbo', load: 1, maxLoad: 5 },
];

const priorityLabels = {
  high: { color: 'destructive', github: 'priority-high' },
  medium: { color: 'default', github: 'priority-medium' },
  low: { color: 'secondary', github: 'priority-low' }
};

export default function PushTaskModal({ open, onClose, task }: PushTaskModalProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignee: '',
    labels: [task?.component.toLowerCase() || '', task?.priority || ''],
    priority: task?.priority || 'medium'
  });
  const { toast } = useToast();

  // Fetch GitHub collaborators
  const { data: collaboratorsData, isLoading: loadingCollaborators, error } = useQuery({
    queryKey: ['/api/github/collaborators'],
    enabled: open, // Only fetch when modal is open
    retry: false, // Don't retry on rate limit errors
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const collaborators = (collaboratorsData as any)?.data || fallbackDevelopers;
  const selectedDev = collaborators.find((dev: any) => dev.login === formData.assignee);
  const isOverloaded = selectedDev && selectedDev.load >= selectedDev.maxLoad;

  // GitHub issue creation mutation
  const createIssueMutation = useMutation({
    mutationFn: async (issueData: any) => {
      const response = await fetch('/api/github/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "GitHub Issue Created!",
          description: (
            <div className="space-y-2">
              <p>Issue #{data.issue.number} created successfully</p>
              <a 
                href={data.issue.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
              >
                <ExternalLink className="h-3 w-3" />
                View on GitHub
              </a>
            </div>
          ),
        });
        onClose();
      } else {
        toast({
          title: "Failed to Create Issue",
          description: data.error || "Something went wrong",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Issue",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the GitHub issue",
        variant: "destructive",
      });
      return;
    }

    const issueData = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority as 'low' | 'medium' | 'high' | 'urgent',
      assignee: formData.assignee || undefined,
      labels: formData.labels.filter(Boolean),
    };

    createIssueMutation.mutate(issueData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Push Task to GitHub
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Pushing to: <span className="font-mono text-xs">StantonManagement/Defogger2</span>
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter GitHub issue title"
              data-testid="input-issue-title"
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe the task requirements..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>
          
          {/* Assignee */}
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select 
              value={formData.assignee} 
              onValueChange={(value) => handleInputChange('assignee', value)}
            >
              <SelectTrigger data-testid="select-assignee">
                <SelectValue placeholder="Select developer" />
              </SelectTrigger>
              <SelectContent>
                {loadingCollaborators ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading collaborators...
                    </div>
                  </SelectItem>
                ) : (
                  collaborators.map((dev: any) => (
                    <SelectItem key={dev.login} value={dev.login}>
                      <div className="flex items-center justify-between w-full">
                        <span>{dev.name || dev.login}</span>
                        {dev.load !== undefined && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {dev.load}/{dev.maxLoad} tasks
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {isOverloaded && (
              <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Warning: {selectedDev?.name} is at maximum capacity
                </span>
              </div>
            )}
          </div>
          
          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => handleInputChange('priority', value)}
            >
              <SelectTrigger data-testid="select-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Labels Preview */}
          <div className="space-y-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {task.component.toLowerCase()}
              </Badge>
              <Badge 
                variant={priorityLabels[task.priority as keyof typeof priorityLabels]?.color as any} 
                className="flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {priorityLabels[task.priority as keyof typeof priorityLabels]?.github}
              </Badge>
            </div>
          </div>
          
          {/* GitHub Issue Preview */}
          <div className="space-y-2">
            <Label>GitHub Issue Preview</Label>
            <div className="p-4 bg-muted rounded-md border">
              <h4 className="font-medium mb-2">{formData.title}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {formData.description || 'No description provided'}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <User className="h-3 w-3" />
                <span>Assignee: {selectedDev?.name || selectedDev?.login || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="button-confirm-push"
              disabled={createIssueMutation.isPending}
            >
              {createIssueMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Issue...
                </>
              ) : (
                'Create GitHub Issue'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}