import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Decision {
  id: string;
  title: string;
  description: string;
  cost?: number;
  timeEstimate?: string;
  priority: 'high' | 'medium' | 'low';
  businessCase: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface DecisionCardProps {
  decision: Decision;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export default function DecisionCard({ 
  decision, 
  showActions = true, 
  onApprove, 
  onReject 
}: DecisionCardProps) {
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(decision.id);
    } else {
      toast({
        title: "Decision Approved",
        description: `"${decision.title}" has been approved`,
      });
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject(decision.id);
    } else {
      toast({
        title: "Decision Rejected",
        description: `"${decision.title}" has been rejected`,
      });
    }
  };

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{decision.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {decision.submittedBy} • {decision.submittedAt}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(decision.priority)} className="capitalize">
              {decision.priority}
            </Badge>
            {decision.status !== 'pending' && (
              <Badge 
                variant="outline" 
                className={`capitalize ${getStatusColor(decision.status)}`}
              >
                {decision.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{decision.description}</p>
        
        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm">
          {decision.cost && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>${decision.cost.toLocaleString()}</span>
            </div>
          )}
          {decision.timeEstimate && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{decision.timeEstimate}</span>
            </div>
          )}
        </div>
        
        {/* Business Case Preview */}
        <div className="p-3 bg-muted rounded-md">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Business Case
          </h4>
          <p className="text-sm">{decision.businessCase}</p>
        </div>
        
        {/* Actions */}
        {showActions && decision.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={handleApprove}
              className="flex items-center gap-2"
              data-testid={`button-approve-${decision.id}`}
            >
              <Check className="h-3 w-3" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleReject}
              className="flex items-center gap-2"
              data-testid={`button-reject-${decision.id}`}
            >
              <X className="h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}