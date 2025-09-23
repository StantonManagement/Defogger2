import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { paymentFormSchema, type PaymentForm } from "@shared/schema";

interface PaymentRecordingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDeveloper?: string;
  defaultTaskTitle?: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

interface DevelopersResponse {
  success: boolean;
  data: Array<{
    name: string;
    active: boolean;
    totalPaid: number;
    totalPending: number;
  }>;
}

export default function PaymentRecordingModal({
  open,
  onOpenChange,
  defaultDeveloper,
  defaultTaskTitle,
  defaultAmount,
  onSuccess
}: PaymentRecordingModalProps) {
  const { toast } = useToast();

  // Fetch developers for dropdown
  const { data: developersResponse } = useQuery<DevelopersResponse>({
    queryKey: ['/api/developers'],
    enabled: open,
  });

  const developers = developersResponse?.data || [];

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      developerName: defaultDeveloper || '',
      amount: defaultAmount || 75,
      paymentType: 'test_project',
      paymentMethod: 'manual',
      taskTitle: defaultTaskTitle || '',
      notes: '',
    },
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentForm) => {
      const response = await apiRequest('POST', '/api/payments', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Recorded",
        description: `Payment of $${form.getValues('amount')} recorded for ${form.getValues('developerName')}`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/ledger'] });
      
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentForm) => {
    createPaymentMutation.mutate(data);
  };

  const selectedPaymentType = form.watch('paymentType');
  const selectedDeveloper = form.watch('developerName');
  
  // Find selected developer info
  const developerInfo = developers.find(dev => dev.name === selectedDeveloper);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="payment-recording-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Record Payment</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Developer Selection */}
            <FormField
              control={form.control}
              name="developerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Developer</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-developer">
                        <SelectValue placeholder="Select developer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {developers.map((developer) => (
                        <SelectItem 
                          key={developer.name} 
                          value={developer.name}
                          data-testid={`option-developer-${developer.name.replace(' ', '-').toLowerCase()}`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{developer.name}</span>
                            {!developer.active && (
                              <Badge variant="outline" className="text-xs ml-2">Inactive</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  
                  {developerInfo && (
                    <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded">
                      <div>Total Paid: ${developerInfo.totalPaid.toFixed(2)}</div>
                      <div>Pending: ${developerInfo.totalPending.toFixed(2)}</div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="75.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Payment Type */}
            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-type">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="test_project" data-testid="option-test-project">
                        Test Project ($75)
                      </SelectItem>
                      <SelectItem value="task" data-testid="option-task">
                        Task Payment
                      </SelectItem>
                      <SelectItem value="bonus" data-testid="option-bonus">
                        Bonus
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                  
                  {selectedPaymentType === 'test_project' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Standard 48-hour test project payment
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Payment Method */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual" data-testid="option-manual">
                        Manual (Outside Platform)
                      </SelectItem>
                      <SelectItem value="onlinejobs" data-testid="option-onlinejobs">
                        OnlineJobs.ph
                      </SelectItem>
                      <SelectItem value="paypal" data-testid="option-paypal">
                        PayPal
                      </SelectItem>
                      <SelectItem value="wise" data-testid="option-wise">
                        Wise
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Title (Optional) */}
            <FormField
              control={form.control}
              name="taskTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Task Queue System Test"
                      {...field}
                      data-testid="input-task-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes (Optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional notes about this payment..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={createPaymentMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPaymentMutation.isPending}
                className="flex-1"
                data-testid="button-submit"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}