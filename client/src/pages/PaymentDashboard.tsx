import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus, 
  Check, 
  Download,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import PaymentRecordingModal from "@/components/PaymentRecordingModal";
import type { PaymentStats, DeveloperPayment } from "@shared/schema";

interface PaymentStatsResponse {
  success: boolean;
  data: PaymentStats;
}

interface PaymentsResponse {
  success: boolean;
  data: DeveloperPayment[];
  count: number;
}

export default function PaymentDashboard() {
  const [showRecordModal, setShowRecordModal] = useState(false);
  const { toast } = useToast();

  // Fetch payment statistics
  const { data: statsResponse, isLoading: statsLoading } = useQuery<PaymentStatsResponse>({
    queryKey: ['/api/payments/stats'],
    enabled: true
  });

  // Fetch recent payments
  const { data: paymentsResponse, isLoading: paymentsLoading } = useQuery<PaymentsResponse>({
    queryKey: ['/api/payments'],
    enabled: true
  });

  // Bulk mark as paid mutation
  const markAllPaidMutation = useMutation({
    mutationFn: async () => {
      if (!paymentsResponse?.data) return;
      
      const pendingPayments = paymentsResponse.data.filter(p => p.paymentStatus === 'pending');
      const paymentIds = pendingPayments.map(p => p.id);
      
      if (paymentIds.length === 0) {
        throw new Error('No pending payments to mark as paid');
      }

      const response = await apiRequest('POST', '/api/payments/bulk', {
        payment_ids: paymentIds,
        status: 'confirmed'
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payments Updated",
        description: `${data.count} payments marked as paid`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/ledger'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payments",
        variant: "destructive",
      });
    },
  });

  // Export ledger function
  const exportLedger = () => {
    if (!paymentsResponse?.data) return;
    
    const csvContent = [
      ['Developer', 'Task', 'Amount', 'Status', 'Method', 'Date', 'Notes'].join(','),
      ...paymentsResponse.data.map(payment => [
        payment.developerName,
        payment.taskTitle || '',
        payment.amount,
        payment.paymentStatus || 'pending',
        payment.paymentMethod || '',
        payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '',
        payment.notes || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Complete",
      description: "Payment ledger exported to CSV",
    });
  };

  const stats = statsResponse?.data;
  const payments = paymentsResponse?.data || [];

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
      case 'confirmed': return <Check className="h-3 w-3" />;
      case 'sent': return <Clock className="h-3 w-3" />;
      case 'pending':
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Dashboard</h1>
          <p className="text-muted-foreground">
            Track payments and manage developer compensation
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          💰 Payments
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-paid">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-7 bg-muted rounded w-20"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-paid">
                ${stats?.totalPaid.toFixed(2) || '0.00'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Confirmed payments
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-payments">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-7 bg-muted rounded w-20"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-pending-amount">
                ${stats?.totalPending.toFixed(2) || '0.00'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.paymentStatus === 'pending').length} tasks
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-active-developers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Developers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-7 bg-muted rounded w-12"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-active-developers">
                {stats?.activeDevelopers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Team members
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-this-month">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-7 bg-muted rounded w-20"></div>
            ) : (
              <div className="text-2xl font-bold" data-testid="text-this-month">
                ${stats?.thisMonth.toFixed(2) || '0.00'}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setShowRecordModal(true)}
              data-testid="button-record-payment"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
            
            <Button
              variant="outline"
              onClick={() => markAllPaidMutation.mutate()}
              disabled={markAllPaidMutation.isPending || !payments.some(p => p.paymentStatus === 'pending')}
              data-testid="button-mark-all-paid"
            >
              <Check className="h-4 w-4 mr-2" />
              {markAllPaidMutation.isPending ? 'Updating...' : 'Mark Test Projects Paid'}
            </Button>
            
            <Button
              variant="outline"
              onClick={exportLedger}
              disabled={payments.length === 0}
              data-testid="button-export-ledger"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Ledger
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card data-testid="card-recent-payments">
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments recorded yet
            </div>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 10).map((payment) => (
                <div 
                  key={payment.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`payment-${payment.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`payment-developer-${payment.id}`}>
                        {payment.developerName}
                      </p>
                      <p className="text-sm text-muted-foreground" data-testid={`payment-task-${payment.id}`}>
                        {payment.taskTitle || 'No task specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium" data-testid={`payment-amount-${payment.id}`}>
                        ${parseFloat(payment.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.paymentMethod || 'manual'}
                      </p>
                    </div>
                    
                    <Badge 
                      variant={getStatusBadgeVariant(payment.paymentStatus)}
                      data-testid={`payment-status-${payment.id}`}
                    >
                      {getStatusIcon(payment.paymentStatus)}
                      <span className="ml-1">
                        {payment.paymentStatus === 'confirmed' ? 'Paid' : 
                         payment.paymentStatus === 'sent' ? 'Sent' : 'Pending'}
                      </span>
                    </Badge>
                  </div>
                </div>
              ))}
              
              {payments.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Payments
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Recording Modal */}
      <PaymentRecordingModal
        open={showRecordModal}
        onOpenChange={setShowRecordModal}
        onSuccess={() => {
          // Refresh data after successful payment recording
          queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
          queryClient.invalidateQueries({ queryKey: ['/api/payments/stats'] });
        }}
      />
    </div>
  );
}