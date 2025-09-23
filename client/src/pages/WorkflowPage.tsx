import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, Zap } from "lucide-react";
import MarkdownViewer from "@/components/MarkdownViewer";

interface WorkflowDocResponse {
  success: boolean;
  data: string;
}

export default function WorkflowPage() {
  // Fetch workflow documentation
  const { data: readmeResponse, isLoading: readmeLoading } = useQuery<WorkflowDocResponse>({
    queryKey: ['/api/workflow', 'readme'],
    enabled: true
  });

  const { data: fullWorkflowResponse, isLoading: fullWorkflowLoading } = useQuery<WorkflowDocResponse>({
    queryKey: ['/api/workflow', 'full-workflow'],
    enabled: true
  });

  const { data: quickRefResponse, isLoading: quickRefLoading } = useQuery<WorkflowDocResponse>({
    queryKey: ['/api/workflow', 'quick-reference'],
    enabled: true
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Guide</h1>
          <p className="text-muted-foreground">
            Complete documentation for the task management workflow
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          Documentation
        </Badge>
      </div>

      {/* Tabbed Documentation */}
      <Card data-testid="workflow-documentation">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Process Documentation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="readme" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger 
                value="readme" 
                className="flex items-center space-x-2"
                data-testid="tab-readme"
              >
                <FileText className="h-4 w-4" />
                <span>README</span>
              </TabsTrigger>
              <TabsTrigger 
                value="full-workflow" 
                className="flex items-center space-x-2"
                data-testid="tab-full-workflow"
              >
                <BookOpen className="h-4 w-4" />
                <span>FULL WORKFLOW</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quick-reference" 
                className="flex items-center space-x-2"
                data-testid="tab-quick-reference"
              >
                <Zap className="h-4 w-4" />
                <span>QUICK REFERENCE</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="readme" className="mt-6">
              <div className="prose-container">
                {readmeLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : readmeResponse?.success ? (
                  <MarkdownViewer 
                    content={readmeResponse.data || ''} 
                    data-testid="markdown-readme"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load README documentation
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="full-workflow" className="mt-6">
              <div className="prose-container">
                {fullWorkflowLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : fullWorkflowResponse?.success ? (
                  <MarkdownViewer 
                    content={fullWorkflowResponse.data || ''}
                    data-testid="markdown-full-workflow" 
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load Full Workflow documentation
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="quick-reference" className="mt-6">
              <div className="prose-container">
                {quickRefLoading ? (
                  <div className="space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : quickRefResponse?.success ? (
                  <MarkdownViewer 
                    content={quickRefResponse.data || ''}
                    data-testid="markdown-quick-reference"
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load Quick Reference documentation
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Review INBOX Daily</p>
                <p className="text-xs text-muted-foreground">
                  Process new ideas and conversations promptly
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Use Standard Templates</p>
                <p className="text-xs text-muted-foreground">
                  Maintain consistency across all task descriptions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-medium">Set Realistic Estimates</p>
                <p className="text-xs text-muted-foreground">
                  Include time for testing and code review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workflow Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">INBOX Backlog</span>
              <Badge variant="secondary">2 items</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Avg. Processing Time</span>
              <Badge variant="outline">1.5 days</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tasks This Week</span>
              <Badge variant="default">7 completed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Team Capacity</span>
              <Badge variant="secondary">75% utilized</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}