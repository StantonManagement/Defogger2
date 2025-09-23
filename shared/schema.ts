import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Project definitions
export const projects = pgTable("projects", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }).default("0"),
  budgetUsed: decimal("budget_used", { precision: 10, scale: 2 }).default("0"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
});

// Component dependencies
export const componentDependencies = pgTable("component_dependencies", {
  component: varchar("component", { length: 50 }),
  dependsOn: varchar("depends_on", { length: 50 }),
  project: varchar("project", { length: 50 }),
  integrationStatus: varchar("integration_status", { length: 50 }).default("pending"),
});

// Developer capacity tracking
export const developerCapacity = pgTable("developer_capacity", {
  developerName: varchar("developer_name", { length: 100 }),
  project: varchar("project", { length: 50 }),
  hoursAllocated: integer("hours_allocated").default(0),
  hoursUsed: integer("hours_used").default(0),
  weekOf: timestamp("week_of"),
});

// Payment Tracking Tables (Enhanced with multi-project support)
export const developerPayments = pgTable("developer_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerName: varchar("developer_name", { length: 100 }).notNull(),
  taskId: varchar("task_id", { length: 200 }),
  taskTitle: varchar("task_title", { length: 500 }),
  project: varchar("project", { length: 50 }).default("collections_system"),
  component: varchar("component", { length: 50 }),
  billableTo: varchar("billable_to", { length: 50 }).default("internal"),
  crossProject: boolean("cross_project").default(false),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: varchar("payment_type", { length: 50 }), // 'component_poc', 'component_integration', etc.
  paymentMethod: varchar("payment_method", { length: 50 }), // 'manual', 'onlinejobs', 'paypal', 'wise'
  paymentStatus: varchar("payment_status", { length: 50 }).default("pending"), // 'pending', 'sent', 'confirmed'
  paymentDate: timestamp("payment_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`NOW()`),
  updatedAt: timestamp("updated_at").default(sql`NOW()`),
});

export const developerLedger = pgTable("developer_ledger", {
  developerName: varchar("developer_name", { length: 100 }).primaryKey(),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).default("0"),
  totalPending: decimal("total_pending", { precision: 10, scale: 2 }).default("0"),
  lastPaymentDate: timestamp("last_payment_date"),
  paymentCount: integer("payment_count").default(0),
  joinedDate: timestamp("joined_date").default(sql`NOW()`),
  active: boolean("active").default(true),
});

export const insertDeveloperPaymentSchema = createInsertSchema(developerPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeveloperLedgerSchema = createInsertSchema(developerLedger).omit({
  joinedDate: true,
});

export type DeveloperPayment = typeof developerPayments.$inferSelect;
export type InsertDeveloperPayment = z.infer<typeof insertDeveloperPaymentSchema>;

export type DeveloperLedger = typeof developerLedger.$inferSelect;
export type InsertDeveloperLedger = z.infer<typeof insertDeveloperLedgerSchema>;

// Payment Statistics Schema
export const paymentStatsSchema = z.object({
  totalPaid: z.number(),
  totalPending: z.number(),
  activeDevelopers: z.number(),
  thisMonth: z.number(),
  recentPayments: z.array(z.object({
    id: z.string(),
    developerName: z.string(),
    amount: z.number(),
    paymentStatus: z.string(),
    paymentDate: z.string().nullable(),
    taskTitle: z.string().nullable(),
  })),
});

export type PaymentStats = z.infer<typeof paymentStatsSchema>;

// Project schema types
export const insertProjectSchema = createInsertSchema(projects);
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Component dependency types
export type ComponentDependency = typeof componentDependencies.$inferSelect;

// Developer capacity types  
export type DeveloperCapacity = typeof developerCapacity.$inferSelect;

// Multi-project stats schema
export const multiProjectStatsSchema = z.object({
  projectStats: z.array(z.object({
    project: z.string(),
    name: z.string(),
    componentsInProgress: z.number(),
    totalComponents: z.number(),
    budgetUsed: z.number(),
    totalBudget: z.number(),
    activeDevelopers: z.number(),
    pendingPayments: z.number(),
  })),
  crossProjectTasks: z.number(),
  overCapacityDevelopers: z.array(z.string()),
  blockedComponents: z.array(z.object({
    component: z.string(),
    project: z.string(),
    blockedBy: z.string(),
  })),
});

export type MultiProjectStats = z.infer<typeof multiProjectStatsSchema>;

// Payment Form Schema
export const paymentFormSchema = z.object({
  developerName: z.string().min(1, "Developer is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentType: z.enum(["component_poc", "component_integration", "feature_development", "bug_fix", "bonus"]),
  paymentMethod: z.enum(["bank_transfer", "paypal", "direct_deposit", "check", "cryptocurrency"]),
  taskId: z.string().optional(),
  taskTitle: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentForm = z.infer<typeof paymentFormSchema>;

// GitHub Issue Schema
export const githubIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assignee: z.string().optional(),
  labels: z.array(z.string()).optional(),
});

export type GitHubIssue = z.infer<typeof githubIssueSchema>;

// GitHub Workload Schema
export const githubWorkloadSchema = z.object({
  login: z.string(),
  avatar_url: z.string().optional(),
  issues: z.array(z.object({
    id: z.number(),
    title: z.string(),
    created_at: z.string(),
    html_url: z.string(),
    labels: z.array(z.object({
      name: z.string(),
      color: z.string(),
    })),
  })),
  totalIssues: z.number(),
  daysSinceOldest: z.number(),
});

export type GitHubWorkload = z.infer<typeof githubWorkloadSchema>;

// GitHub Collaborator Schema
export const githubCollaboratorSchema = z.object({
  login: z.string(),
  avatar_url: z.string().optional(),
  html_url: z.string(),
});

export type GitHubCollaborator = z.infer<typeof githubCollaboratorSchema>;

// Task Review Schema (Enhanced with multi-project support)
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["high", "medium", "low"]),
  days: z.number().int().min(1, "Days must be at least 1"),
  budget: z.number().min(0, "Budget must be non-negative"),
  paymentTerms: z.enum(["on-complete", "50-50", "25-50-25"]),
  developer: z.string().min(1, "Developer is required"),
  project: z.string().default("collections_system"),
  component: z.string().optional(),
  crossProject: z.boolean().default(false),
  dependencies: z.array(z.string()).optional(),
  status: z.enum(["ready", "needs-review", "in-progress", "completed", "blocked"]),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const insertTaskSchema = taskSchema.omit({ id: true, createdAt: true, updatedAt: true });

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Payment breakdown type
export const paymentBreakdownSchema = z.object({
  upfront: z.number(),
  middle: z.number(),
  final: z.number(),
  total: z.number(),
});

export type PaymentBreakdown = z.infer<typeof paymentBreakdownSchema>;

// Payment breakdown calculation helpers with proper rounding
export const calculatePaymentBreakdown = (budget: number, paymentTerms: Task['paymentTerms']): PaymentBreakdown => {
  let upfront: number, middle: number, final: number;
  
  switch (paymentTerms) {
    case "on-complete":
      upfront = 0;
      middle = 0;
      final = budget;
      break;
    case "50-50":
      upfront = Math.round(budget * 0.5 * 100) / 100;
      middle = 0;
      final = budget - upfront; // Ensure exact total
      break;
    case "25-50-25":
      upfront = Math.round(budget * 0.25 * 100) / 100;
      middle = Math.round(budget * 0.5 * 100) / 100;
      final = budget - upfront - middle; // Ensure exact total
      break;
    default:
      upfront = 0;
      middle = 0;
      final = budget;
  }
  
  return {
    upfront,
    middle,
    final,
    total: budget,
  };
};
