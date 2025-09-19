import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConnectionStatusProps {
  service: string;
  isConnected: boolean;
  lastConnection?: string;
}

export default function ConnectionStatus({ service, isConnected, lastConnection }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <CheckCircle className="h-4 w-4 text-green-500" data-testid={`status-${service.toLowerCase()}-connected`} />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" data-testid={`status-${service.toLowerCase()}-disconnected`} />
      )}
      <span className="text-sm font-medium">{service}</span>
      <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      {lastConnection && isConnected && (
        <span className="text-xs text-muted-foreground">
          Last: {lastConnection}
        </span>
      )}
    </div>
  );
}