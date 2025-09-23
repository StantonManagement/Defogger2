import { 
  type User, 
  type InsertUser,
  type DeveloperPayment,
  type InsertDeveloperPayment,
  type DeveloperLedger,
  type InsertDeveloperLedger,
  type PaymentStats,
  type Project,
  type InsertProject,
  type ComponentDependency,
  type DeveloperCapacity,
  type MultiProjectStats,
  type Task
} from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword, comparePassword } from "./auth-utils";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  
  // Payment methods (enhanced with multi-project)
  getPayments(filters?: { 
    developerName?: string; 
    status?: string; 
    project?: string; 
    component?: string;
    fromDate?: string; 
    toDate?: string; 
  }): Promise<DeveloperPayment[]>;
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
  getMultiProjectStats(): Promise<MultiProjectStats>;
  
  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  
  // Component dependency methods
  getComponentDependencies(project?: string): Promise<ComponentDependency[]>;
  addComponentDependency(dependency: ComponentDependency): Promise<ComponentDependency>;
  
  // Developer capacity methods
  getDeveloperCapacity(developerName?: string, weekOf?: Date): Promise<DeveloperCapacity[]>;
  updateDeveloperCapacity(capacity: DeveloperCapacity): Promise<DeveloperCapacity>;
  
  // Task methods (enhanced)
  getTasks(filters?: { 
    project?: string; 
    component?: string;
    developer?: string; 
    status?: string; 
    crossProject?: boolean;
  }): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, task: Partial<Task>): Promise<Task>;
  validateTaskAssignment(task: Partial<Task>): Promise<{ valid: boolean; error?: string; warning?: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private payments: Map<string, DeveloperPayment>;
  private ledgers: Map<string, DeveloperLedger>;
  private projects: Map<string, Project>;
  private componentDependencies: Map<string, ComponentDependency[]>;
  private developerCapacities: Map<string, DeveloperCapacity>;
  private tasks: Map<string, Task>;

  constructor() {
    this.users = new Map();
    this.payments = new Map();
    this.ledgers = new Map();
    this.projects = new Map();
    this.componentDependencies = new Map();
    this.developerCapacities = new Map();
    this.tasks = new Map();
    
    // Initialize with mock data as specified
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock payments for the component developers (Enhanced with multi-project support)
    const mockPayments: DeveloperPayment[] = [
      {
        id: 'pay_001',
        developerName: 'Jose Enrico Maxino',
        taskId: 'task_001',
        taskTitle: 'Task Queue System Component',
        project: 'collections_system',
        component: 'task_queue',
        billableTo: 'internal',
        crossProject: false,
        amount: '75.00',
        paymentType: 'component_poc',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        notes: 'Core async processing component for collections system',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_002',
        developerName: 'Christian Sumoba',
        taskId: 'task_002',
        taskTitle: 'Event Bus System Component',
        project: 'collections_system',
        component: 'event_bus',
        billableTo: 'internal',
        crossProject: false,
        amount: '75.00',
        paymentType: 'component_poc',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        notes: 'Real-time messaging between collection agents',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_003',
        developerName: 'Cedrick Barzaga',
        taskId: 'task_003',
        taskTitle: 'Notification Service Component',
        project: 'collections_system',
        component: 'notifications',
        billableTo: 'internal',
        crossProject: false,
        amount: '75.00',
        paymentType: 'component_poc',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        notes: 'Multi-channel tenant communication system',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_004',
        developerName: 'Gabriel Jerdhy Lapuz',
        taskId: 'task_004',
        taskTitle: 'Document Processing Component',
        project: 'collections_system',
        component: 'documents',
        billableTo: 'internal',
        crossProject: false,
        amount: '75.00',
        paymentType: 'component_poc',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        notes: 'OCR for payment receipts and lease documents',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'pay_005',
        developerName: 'Paul Limbo',
        taskId: 'task_005',
        taskTitle: 'Core API Framework Component',
        project: 'collections_system',
        component: 'api_framework',
        billableTo: 'internal',
        crossProject: false,
        amount: '75.00',
        paymentType: 'component_poc',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'pending',
        notes: 'FastAPI foundation for collections system',
        paymentDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Initialize mock projects
    const mockProjects: Project[] = [
      {
        id: 'collections_system',
        name: 'Collections System',
        budget: '10000.00',
        budgetUsed: '375.00',
        status: 'active',
        createdAt: new Date(),
      },
      {
        id: 'property_management', 
        name: 'Property Management',
        budget: '5000.00',
        budgetUsed: '0.00',
        status: 'planning',
        createdAt: new Date(),
      },
      {
        id: 'client_work',
        name: 'Client Projects',
        budget: '15000.00', 
        budgetUsed: '2500.00',
        status: 'active',
        createdAt: new Date(),
      },
    ];

    // Initialize mock component dependencies
    const mockDependencies: ComponentDependency[] = [
      { component: 'task_queue', dependsOn: 'api_framework', project: 'collections_system', integrationStatus: 'pending' },
      { component: 'notifications', dependsOn: 'task_queue', project: 'collections_system', integrationStatus: 'pending' },
      { component: 'notifications', dependsOn: 'event_bus', project: 'collections_system', integrationStatus: 'pending' },
      { component: 'documents', dependsOn: 'api_framework', project: 'collections_system', integrationStatus: 'pending' },
      { component: 'event_bus', dependsOn: 'api_framework', project: 'collections_system', integrationStatus: 'pending' },
    ];

    // Initialize projects
    for (const project of mockProjects) {
      this.projects.set(project.id, project);
    }

    // Initialize component dependencies
    this.componentDependencies.set('collections_system', mockDependencies);

    // Mock ledgers for component developers
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
        developerName: 'Cedrick Barzaga',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'Gabriel Jerdhy Lapuz',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'Paul Limbo',
        totalPaid: '0',
        totalPending: '75',
        lastPaymentDate: null,
        paymentCount: 0,
        joinedDate: new Date(),
        active: true,
      },
      {
        developerName: 'Kurt',
        totalPaid: '200',
        totalPending: '0',
        lastPaymentDate: new Date(),
        paymentCount: 2,
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
    // Hash the password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    const user: User = { ...insertUser, password: hashedPassword, id };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return null;
    }
    
    return user;
  }

  // Payment methods implementation (Enhanced with multi-project support)
  async getPayments(filters?: { 
    developerName?: string; 
    status?: string; 
    project?: string; 
    component?: string;
    fromDate?: string; 
    toDate?: string; 
  }): Promise<DeveloperPayment[]> {
    let payments = Array.from(this.payments.values());
    
    if (filters?.developerName) {
      payments = payments.filter(p => p.developerName === filters.developerName);
    }
    
    if (filters?.status) {
      payments = payments.filter(p => p.paymentStatus === filters.status);
    }
    
    if (filters?.project) {
      payments = payments.filter(p => p.project === filters.project);
    }
    
    if (filters?.component) {
      payments = payments.filter(p => p.component === filters.component);
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
      project: insertPayment.project || 'collections_system',
      component: insertPayment.component || null,
      billableTo: insertPayment.billableTo || 'internal',
      crossProject: insertPayment.crossProject || false,
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

  // Multi-project stats method
  async getMultiProjectStats(): Promise<MultiProjectStats> {
    const projects = Array.from(this.projects.values());
    const payments = Array.from(this.payments.values());
    
    const projectStats = projects.map(project => {
      const projectPayments = payments.filter(p => p.project === project.id);
      const uniqueDevelopers = new Set(projectPayments.map(p => p.developerName));
      
      return {
        project: project.id,
        name: project.name,
        componentsInProgress: projectPayments.filter(p => p.paymentStatus === 'pending').length,
        totalComponents: 6, // hardcoded for now, could be dynamic
        budgetUsed: parseFloat(project.budgetUsed || '0'),
        totalBudget: parseFloat(project.budget || '0'),
        activeDevelopers: uniqueDevelopers.size,
        pendingPayments: projectPayments.filter(p => p.paymentStatus === 'pending').length,
      };
    });
    
    return {
      projectStats,
      crossProjectTasks: payments.filter(p => p.crossProject).length,
      overCapacityDevelopers: [], // TODO: implement capacity checking
      blockedComponents: [], // TODO: implement dependency blocking logic
    };
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject: Project = {
      id: project.id,
      name: project.name,
      budget: project.budget || '0.00',
      budgetUsed: project.budgetUsed || '0.00',
      status: project.status || 'active',
      createdAt: new Date(),
    };
    this.projects.set(project.id, newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const existing = this.projects.get(id);
    if (!existing) {
      throw new Error(`Project ${id} not found`);
    }
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  // Component dependency methods
  async getComponentDependencies(project?: string): Promise<ComponentDependency[]> {
    if (project) {
      return this.componentDependencies.get(project) || [];
    }
    
    const allDependencies: ComponentDependency[] = [];
    const depsArray = Array.from(this.componentDependencies.values());
    for (const deps of depsArray) {
      allDependencies.push(...deps);
    }
    return allDependencies;
  }

  async addComponentDependency(dependency: ComponentDependency): Promise<ComponentDependency> {
    const project = dependency.project || 'unknown';
    const projectDeps = this.componentDependencies.get(project) || [];
    projectDeps.push(dependency);
    this.componentDependencies.set(project, projectDeps);
    return dependency;
  }

  // Developer capacity methods
  async getDeveloperCapacity(developerName?: string, weekOf?: Date): Promise<DeveloperCapacity[]> {
    const capacities = Array.from(this.developerCapacities.values());
    
    let filtered = capacities;
    if (developerName) {
      filtered = filtered.filter(c => c.developerName === developerName);
    }
    if (weekOf) {
      filtered = filtered.filter(c => c.weekOf?.getTime() === weekOf.getTime());
    }
    
    return filtered;
  }

  async updateDeveloperCapacity(capacity: DeveloperCapacity): Promise<DeveloperCapacity> {
    const key = `${capacity.developerName}-${capacity.project}-${capacity.weekOf?.getTime()}`;
    this.developerCapacities.set(key, capacity);
    return capacity;
  }

  // Task methods (enhanced)
  async getTasks(filters?: { 
    project?: string; 
    component?: string;
    developer?: string; 
    status?: string; 
    crossProject?: boolean;
  }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());
    
    if (filters?.project) {
      tasks = tasks.filter(t => t.project === filters.project);
    }
    if (filters?.component) {
      tasks = tasks.filter(t => t.component === filters.component);
    }
    if (filters?.developer) {
      tasks = tasks.filter(t => t.developer === filters.developer);
    }
    if (filters?.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters?.crossProject !== undefined) {
      tasks = tasks.filter(t => t.crossProject === filters.crossProject);
    }
    
    return tasks;
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const existing = this.tasks.get(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }
    const updated = {
      ...existing,
      ...task,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async validateTaskAssignment(task: Partial<Task>): Promise<{ valid: boolean; error?: string; warning?: string }> {
    // Check if developer is already assigned to this component
    if (task.developer && task.component) {
      const existingTasks = Array.from(this.tasks.values());
      const conflicting = existingTasks.find(t => 
        t.developer === task.developer && 
        t.component === task.component && 
        t.id !== task.id
      );
      
      if (conflicting) {
        return { 
          valid: false, 
          error: `${task.developer} already owns ${task.component}` 
        };
      }
    }
    
    // Check developer capacity (simplified - in practice would check hours)
    if (task.developer) {
      const developerTasks = Array.from(this.tasks.values()).filter(t => 
        t.developer === task.developer && t.status === 'in-progress'
      );
      
      if (developerTasks.length >= 3) { // arbitrary limit
        return {
          valid: false,
          warning: `${task.developer} is over capacity this week`
        };
      }
    }
    
    return { valid: true };
  }
}

export const storage = new MemStorage();
