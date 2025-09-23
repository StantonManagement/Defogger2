import { 
  type User, 
  type InsertUser,
  type DeveloperPayment,
  type InsertDeveloperPayment,
  type DeveloperLedger,
  type InsertDeveloperLedger,
  type PaymentStats
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Payment methods
  getPayments(filters?: { developerName?: string; status?: string; fromDate?: string; toDate?: string }): Promise<DeveloperPayment[]>;
  getPayment(id: string): Promise<DeveloperPayment | undefined>;
  createPayment(payment: InsertDeveloperPayment): Promise<DeveloperPayment>;
  updatePaymentStatus(id: string, status: string): Promise<DeveloperPayment | undefined>;
  bulkUpdatePaymentStatus(ids: string[], status: string): Promise<DeveloperPayment[]>;
  
  // Ledger methods
  getDeveloperLedgers(): Promise<DeveloperLedger[]>;
  getDeveloperLedger(developerName: string): Promise<DeveloperLedger | undefined>;
  updateDeveloperLedger(developerName: string, ledger: Partial<DeveloperLedger>): Promise<DeveloperLedger>;
  
  // Stats methods
  getPaymentStats(): Promise<PaymentStats>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private payments: Map<string, DeveloperPayment>;
  private ledgers: Map<string, DeveloperLedger>;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
    this.ledgers = new Map();
    
    // Initialize with mock data as specified
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock payments for the 4 developers
    const mockPayments: DeveloperPayment[] = [
      {
        id: 'pay_001',
        developerName: 'Jose Enrico Maxino',
        taskId: 'task_001',
        taskTitle: 'Task Queue System Test',
        amount: '75.00',
        paymentType: 'test_project',
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        notes: '48-hour test project',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_002',
        developerName: 'Christian Sumoba',
        taskId: 'task_002',
        taskTitle: 'Event Bus System Test',
        amount: '75.00',
        paymentType: 'test_project',
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        notes: '48-hour test project',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_003',
        developerName: 'James Martinez',
        taskId: 'task_003',
        taskTitle: 'Notification Service Test',
        amount: '75.00',
        paymentType: 'test_project',
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        notes: '48-hour test project',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_004',
        developerName: 'Gabriel Tiburcio',
        taskId: 'task_004',
        taskTitle: 'Document Processing Test',
        amount: '75.00',
        paymentType: 'test_project',
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        notes: '48-hour test project',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Mock ledgers for the 4 developers
    const mockLedgers: DeveloperLedger[] = [
      {
        developerName: 'Jose Enrico Maxino',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'Christian Sumoba',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'James Martinez',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'Gabriel Tiburcio',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
    ];

    // Populate the maps
    mockPayments.forEach(payment => {
      this.payments.set(payment.id, payment);
    });

    mockLedgers.forEach(ledger => {
      this.ledgers.set(ledger.developerName, ledger);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Payment methods implementation
  async getPayments(filters?: { developerName?: string; status?: string; fromDate?: string; toDate?: string }): Promise<DeveloperPayment[]> {
    let payments = Array.from(this.payments.values());
    
    if (filters?.developerName) {
      payments = payments.filter(p => p.developerName === filters.developerName);
    }
    
    if (filters?.status) {
      payments = payments.filter(p => p.paymentStatus === filters.status);
    }
    
    if (filters?.fromDate) {
      const fromDate = new Date(filters.fromDate);
      payments = payments.filter(p => p.createdAt && p.createdAt >= fromDate);
    }
    
    if (filters?.toDate) {
      const toDate = new Date(filters.toDate);
      payments = payments.filter(p => p.createdAt && p.createdAt <= toDate);
    }
    
    return payments.sort((a, b) => {
      const aTime = a.createdAt?.getTime() || 0;
      const bTime = b.createdAt?.getTime() || 0;
      return bTime - aTime;
    });
  }

  async getPayment(id: string): Promise<DeveloperPayment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertDeveloperPayment): Promise<DeveloperPayment> {
    const id = randomUUID();
    const now = new Date();
    const payment: DeveloperPayment = {
      id,
      developerName: insertPayment.developerName,
      taskId: insertPayment.taskId || null,
      taskTitle: insertPayment.taskTitle || null,
      amount: insertPayment.amount,
      paymentType: insertPayment.paymentType || null,
      paymentMethod: insertPayment.paymentMethod || null,
      paymentStatus: insertPayment.paymentStatus || 'pending',
      paymentDate: insertPayment.paymentDate || null,
      notes: insertPayment.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.payments.set(id, payment);
    
    // Update ledger
    await this.updateLedgerAfterPaymentChange(payment.developerName);
    
    return payment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<DeveloperPayment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment: DeveloperPayment = {
      ...payment,
      paymentStatus: status,
      paymentDate: status === 'confirmed' ? new Date() : payment.paymentDate,
      updatedAt: new Date(),
    };
    
    this.payments.set(id, updatedPayment);
    
    // Update ledger
    await this.updateLedgerAfterPaymentChange(payment.developerName);
    
    return updatedPayment;
  }

  async bulkUpdatePaymentStatus(ids: string[], status: string): Promise<DeveloperPayment[]> {
    const updatedPayments: DeveloperPayment[] = [];
    const developersToUpdate = new Set<string>();
    
    for (const id of ids) {
      const payment = await this.updatePaymentStatus(id, status);
      if (payment) {
        updatedPayments.push(payment);
        developersToUpdate.add(payment.developerName);
      }
    }
    
    // Update ledgers for affected developers
    for (const developerName of Array.from(developersToUpdate)) {
      await this.updateLedgerAfterPaymentChange(developerName);
    }
    
    return updatedPayments;
  }

  // Ledger methods implementation
  async getDeveloperLedgers(): Promise<DeveloperLedger[]> {
    return Array.from(this.ledgers.values()).sort((a, b) => a.developerName.localeCompare(b.developerName));
  }

  async getDeveloperLedger(developerName: string): Promise<DeveloperLedger | undefined> {
    return this.ledgers.get(developerName);
  }

  async updateDeveloperLedger(developerName: string, ledger: Partial<DeveloperLedger>): Promise<DeveloperLedger> {
    const existingLedger = this.ledgers.get(developerName);
    const updatedLedger: DeveloperLedger = {
      ...existingLedger,
      ...ledger,
      developerName, // Ensure the key field is set
    } as DeveloperLedger;
    
    this.ledgers.set(developerName, updatedLedger);
    return updatedLedger;
  }

  private async updateLedgerAfterPaymentChange(developerName: string): Promise<void> {
    const payments = await this.getPayments({ developerName });
    
    const totalPaid = payments
      .filter(p => p.paymentStatus === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const totalPending = payments
      .filter(p => p.paymentStatus === 'pending' || p.paymentStatus === 'sent')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    const confirmedPayments = payments.filter(p => p.paymentStatus === 'confirmed');
    const lastPaymentDate = confirmedPayments.length > 0 
      ? confirmedPayments[0].paymentDate 
      : null;
    
    await this.updateDeveloperLedger(developerName, {
      totalPaid: totalPaid.toString(),
      totalPending: totalPending.toString(),
      lastPaymentDate,
      paymentCount: confirmedPayments.length,
    });
  }

  // Stats methods implementation
  async getPaymentStats(): Promise<PaymentStats> {
    const payments = await this.getPayments();
    const ledgers = await this.getDeveloperLedgers();
    
    const totalPaid = ledgers.reduce((sum, l) => sum + parseFloat(l.totalPaid || '0'), 0);
    const totalPending = ledgers.reduce((sum, l) => sum + parseFloat(l.totalPending || '0'), 0);
    const activeDevelopers = ledgers.filter(l => l.active).length;
    
    // Calculate this month's payments
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthPayments = payments.filter(p => 
      p.paymentStatus === 'confirmed' && 
      p.paymentDate && 
      new Date(p.paymentDate) >= startOfMonth
    );
    const thisMonth = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    // Get recent payments (last 10)
    const recentPayments = payments.slice(0, 10).map(p => ({
      id: p.id,
      developerName: p.developerName,
      amount: parseFloat(p.amount),
      paymentStatus: p.paymentStatus || 'pending',
      paymentDate: p.paymentDate?.toISOString() || null,
      taskTitle: p.taskTitle,
    }));
    
    return {
      totalPaid,
      totalPending,
      activeDevelopers,
      thisMonth,
      recentPayments,
    };
  }
}

export const storage = new MemStorage();
