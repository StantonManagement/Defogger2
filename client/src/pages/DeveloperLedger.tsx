import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Clock, 
  FileText, 
  Plus, 
  History,
  Calendar,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DeveloperLedger, DeveloperPayment } from "@shared/schema";

interface DeveloperLedgerWithPayments extends DeveloperLedger {
  recentPayments: DeveloperPayment[];
}

interface LedgerResponse {
  success: boolean;
  data: DeveloperLedgerWithPayments[];
}

export default function DeveloperLedgerPage() {
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch developer ledgers with recent payments
  const { data: ledgerResponse, isLoading: ledgerLoading } = useQuery<LedgerResponse>({
    queryKey: ['/api/payments/ledger'],
    enabled: true
  });

  const ledgers = ledgerResponse?.data || [];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'sent': return 'secondary';
      case 'pending': 
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'confirmed': return '✓';
      case 'sent': return '⏳';
      case 'pending':
      default: return '○';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Ledger</h1>
          <p className="text-muted-foreground">
            Individual developer payment tracking and history
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          👥 Team
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Team Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ledgers.reduce((sum, l) => sum + parseFloat(l.totalPaid || '0'), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all developers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ledgers.reduce((sum, l) => sum + parseFloat(l.totalPending || '0'), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Developer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ledgers.length > 0 ? 
                (ledgers.reduce((sum, l) => sum + parseFloat(l.totalPaid || '0'), 0) / ledgers.length).toFixed(2) :
                '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per team member
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ledgerLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-5 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="h-12 bg-muted rounded"></div>
                  <div className="h-12 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : ledgers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No developers found
          </div>
        ) : (
          ledgers.map((ledger) => (
            <Card 
              key={ledger.developerName} 
              className="hover-elevate"
              data-testid={`developer-card-${ledger.developerName.replace(' ', '-').toLowerCase()}`}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(ledger.developerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`developer-name-${ledger.developerName.replace(' ', '-').toLowerCase()}`}>
                      {ledger.developerName}
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {formatDate(ledger.joinedDate)}</span>
                      {ledger.active && (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Payment Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-green-600" data-testid={`total-paid-${ledger.developerName.replace(' ', '-').toLowerCase()}`}>
                      ${parseFloat(ledger.totalPaid || '0').toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Paid</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600" data-testid={`total-pending-${ledger.developerName.replace(' ', '-').toLowerCase()}`}>
                      ${parseFloat(ledger.totalPending || '0').toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-bold" data-testid={`payment-count-${ledger.developerName.replace(' ', '-').toLowerCase()}`}>
                      {ledger.paymentCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Tasks</div>
                  </div>
                </div>

                {/* Recent Payments */}
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <History className="h-4 w-4 mr-2" />
                    Recent Payments
                  </h4>
                  {ledger.recentPayments && ledger.recentPayments.length > 0 ? (
                    <div className="space-y-2">
                      {ledger.recentPayments.slice(0, 3).map((payment) => (
                        <div 
                          key={payment.id} 
                          className="flex items-center justify-between p-2 border rounded text-sm"
                          data-testid={`recent-payment-${payment.id}`}
                        >
                          <div className="flex-1">
                            <div className="font-medium">
                              {payment.taskTitle || 'Task payment'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(payment.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              ${parseFloat(payment.amount).toFixed(2)}
                            </span>
                            <Badge variant={getStatusBadgeVariant(payment.paymentStatus)} className="text-xs">
                              {getStatusIcon(payment.paymentStatus)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      No payments yet
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    data-testid={`button-record-payment-${ledger.developerName.replace(' ', '-').toLowerCase()}`}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Record Payment
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    data-testid={`button-view-history-${ledger.developerName.replace(' ', '-').toLowerCase()}`}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View History
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Footer */}
      {ledgers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="font-medium">Active Developers</div>
                  <div>{ledgers.filter(l => l.active).length}</div>
                </div>
                <div>
                  <div className="font-medium">Last Payment</div>
                  <div>
                    {ledgers.some(l => l.lastPaymentDate) ? 
                      formatDate(
                        ledgers
                          .filter(l => l.lastPaymentDate)
                          .sort((a, b) => new Date(b.lastPaymentDate!).getTime() - new Date(a.lastPaymentDate!).getTime())[0]
                          ?.lastPaymentDate
                      ) :
                      'No payments yet'
                    }
                  </div>
                </div>
                <div>
                  <div className="font-medium">Total Payments Made</div>
                  <div>{ledgers.reduce((sum, l) => sum + (l.paymentCount || 0), 0)}</div>
                </div>
                <div>
                  <div className="font-medium">Average Payment</div>
                  <div>
                    ${ledgers.length > 0 && ledgers.some(l => (l.paymentCount || 0) > 0) ? 
                      (ledgers.reduce((sum, l) => sum + parseFloat(l.totalPaid || '0'), 0) / 
                       ledgers.reduce((sum, l) => sum + (l.paymentCount || 0), 0)).toFixed(2) :
                      '0.00'
                    }
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}