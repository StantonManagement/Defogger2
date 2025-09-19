import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, GitBranch, User, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const developers = [
  { id: 'kurt', name: 'Kurt Anderson', load: 4, maxLoad: 5 },
  { id: 'sarah', name: 'Sarah Chen', load: 2, maxLoad: 5 },
  { id: 'mike', name: 'Mike Johnson', load: 5, maxLoad: 5 },
  { id: 'alex', name: 'Alex Rodriguez', load: 1, maxLoad: 4 },
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

  const selectedDev = developers.find(dev => dev.id === formData.assignee);
  const isOverloaded = selectedDev && selectedDev.load >= selectedDev.maxLoad;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Creating GitHub issue with:', formData);
    
    toast({
      title: "GitHub Issue Created",
      description: `Issue "${formData.title}" has been created and assigned to ${selectedDev?.name || 'unassigned'}`,
    });
    
    onClose();
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
                {developers.map((dev) => (
                  <SelectItem key={dev.id} value={dev.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{dev.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {dev.load}/{dev.maxLoad} tasks
                      </span>
                    </div>
                  </SelectItem>
                ))}
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
                <span>Assignee: {selectedDev?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" data-testid="button-confirm-push">
              Create GitHub Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}