import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Folder, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Github,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import MarkdownViewer from "@/components/MarkdownViewer";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TaskFile } from "../../../shared/mockData";

interface FoldersResponse {
  success: boolean;
  data: Array<{
    name: string;
    path: string;
    count: number;
    tasks: TaskFile[];
  }>;
}

interface TasksResponse {
  success: boolean;
  data: TaskFile[];
}

// Map URL folder params to actual folder names
const folderMapping: Record<string, string> = {
  "inbox": "INBOX",
  "ready": "READY_TO_ASSIGN", 
  "assigned": "ASSIGNED",
  "archive": "ARCHIVE"
};

const reverseFolderMapping: Record<string, string> = {
  "INBOX": "inbox",
  "READY_TO_ASSIGN": "ready",
  "ASSIGNED": "assigned", 
  "ARCHIVE": "archive"
};

export default function TasksPage() {
  const [location, setLocation] = useLocation();
  const [selectedTask, setSelectedTask] = useState<TaskFile | null>(null);
  const { toast } = useToast();
  
  // Get folder from URL query params - using window.location for query params
  const urlParams = new URLSearchParams(window.location.search);
  const folderParam = urlParams.get('folder') || 'inbox';
  const selectedFolder = folderMapping[folderParam] || 'INBOX';

  // Fetch folders
  const { data: foldersResponse } = useQuery<FoldersResponse>({
    queryKey: ['/api/folders'],
    enabled: true
  });

  // Fetch tasks for selected folder
  const { data: tasksResponse, isLoading: isTasksLoading } = useQuery<TasksResponse>({
    queryKey: ['/api/tasks', selectedFolder],
    enabled: !!selectedFolder
  });

  const folders = foldersResponse?.data || [];
  const currentTasks = tasksResponse?.data || [];
  const currentFolder = folders.find(f => f.name === selectedFolder);

  // Update URL when folder changes
  const handleFolderChange = (newFolder: string) => {
    const urlFolderParam = reverseFolderMapping[newFolder] || 'inbox';
    setLocation(`/tasks?folder=${urlFolderParam}`);
  };

  // GitHub issue creation mutation for tasks
  const createTaskIssueMutation = useMutation({
    mutationFn: async (taskData: TaskFile) => {
      const response = await apiRequest('POST', '/api/github/issue', {
        title: `Task: ${taskData.title}`,
        body: taskData.content,
        labels: ["task", taskData.priority || "medium"].filter(Boolean)
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "GitHub Issue Created",
        description: "Task has been successfully pushed to GitHub as an issue",
      });
      if (data.issue?.url) {
        window.open(data.issue.url, '_blank');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create GitHub issue",
        variant: "destructive",
      });
    }
  });

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300";
      case "medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300";
      case "low":
        return "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  const getFolderColor = (folderName: string) => {
    switch (folderName) {
      case "INBOX":
        return "workflow-inbox";
      case "READY_TO_ASSIGN":
        return "workflow-ready";
      case "ASSIGNED":
        return "workflow-assigned";
      case "ARCHIVE":
        return "workflow-archived";
      default:
        return "bg-gray-500/10 border-gray-500/20 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Browse and manage tasks across workflow stages
          </p>
        </div>
      </div>

      {/* Folder Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Folder className="h-5 w-5" />
            <span>Select Folder</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedFolder} onValueChange={handleFolderChange}>
              <SelectTrigger className="w-64" data-testid="select-folder">
                <SelectValue placeholder="Choose a folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder.name} value={folder.name}>
                    <div className="flex items-center space-x-2">
                      <span>{folder.name.replace(/_/g, " ")}</span>
                      <Badge variant="secondary" className="text-xs">
                        {folder.count}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {currentFolder && (
              <Badge 
                className={`${getFolderColor(selectedFolder)} border-2`}
                data-testid={`badge-folder-${selectedFolder.toLowerCase()}`}
              >
                {currentFolder.count} items
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {isTasksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTasks.map((task) => (
          <Card 
            key={task.filename} 
            className="hover-elevate transition-all duration-200 cursor-pointer"
            data-testid={`task-card-${task.filename}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{task.filename}</span>
                </div>
                {task.priority && (
                  <Badge 
                    className={`${getPriorityColor(task.priority)} text-xs flex-shrink-0`}
                    data-testid={`priority-${task.priority}`}
                  >
                    {task.priority}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Task Metadata */}
              <div className="space-y-2">
                {task.for && (
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">For:</span>
                    <span className="font-medium">{task.for}</span>
                  </div>
                )}
                
                {task.days && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Days:</span>
                    <span className="font-medium">{task.days}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Task Summary */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {task.content.split('\n').find(line => 
                    line.trim() && !line.startsWith('#') && !line.startsWith('**')
                  )?.trim() || "No description available"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedTask(task)}
                      data-testid={`button-view-details-${task.filename}`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>{task.title}</span>
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] w-full">
                      <div className="pr-4 space-y-6">
                        {/* Task Overview */}
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4 text-sm">
                            {task.for && (
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">For:</span>
                                <span className="font-medium">{task.for}</span>
                              </div>
                            )}
                            {task.days && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Days:</span>
                                <span className="font-medium">{task.days}</span>
                              </div>
                            )}
                            {task.priority && (
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Description Section */}
                        <Collapsible defaultOpen>
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">Description</span>
                            </div>
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3">
                            <div className="pl-6">
                              <MarkdownViewer 
                                content={task.content.split('## Success Criteria')[0] || task.content}
                                data-testid="task-description-content"
                              />
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Success Criteria Section */}
                        {task.content.includes('## Success Criteria') && (
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                              <div className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">Success Criteria</span>
                              </div>
                              <ChevronRight className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <div className="pl-6">
                                <MarkdownViewer 
                                  content={task.content.split('## Success Criteria')[1]?.split('## Technical Notes')[0] || ''}
                                  data-testid="task-success-criteria-content"
                                />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}

                        {/* Technical Notes Section */}
                        {task.content.includes('## Technical Notes') && (
                          <Collapsible>
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted">
                              <div className="flex items-center space-x-2">
                                <Github className="h-4 w-4" />
                                <span className="font-medium">Technical Notes</span>
                              </div>
                              <ChevronRight className="h-4 w-4" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-3">
                              <div className="pl-6">
                                <MarkdownViewer 
                                  content={task.content.split('## Technical Notes')[1] || ''}
                                  data-testid="task-technical-notes-content"
                                />
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {selectedFolder === "READY_TO_ASSIGN" && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => createTaskIssueMutation.mutate(task)}
                    disabled={createTaskIssueMutation.isPending}
                    data-testid={`button-push-github-${task.filename}`}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    {createTaskIssueMutation.isPending ? "Creating..." : "Push to GitHub"}
                  </Button>
                )}

                {selectedFolder === "ASSIGNED" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid={`button-view-github-${task.filename}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Issue
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Empty State */}
      {currentTasks.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Folder className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No tasks found</h3>
                <p className="text-muted-foreground">
                  The {selectedFolder.replace(/_/g, " ")} folder is empty
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}