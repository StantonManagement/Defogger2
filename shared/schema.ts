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

// Payment Tracking Tables
export const developerPayments = pgTable("developer_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  developerName: varchar("developer_name", { length: 100 }).notNull(),
  taskId: varchar("task_id", { length: 200 }),
  taskTitle: varchar("task_title", { length: 500 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: varchar("payment_type", { length: 50 }), // 'test_project', 'task', 'bonus'
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

// Payment Form Schema
export const paymentFormSchema = z.object({
  developerName: z.string().min(1, "Developer is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentType: z.enum(["test_project", "task", "bonus"]),
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

// Task Review Schema
export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["high", "medium", "low"]),
  days: z.number().int().min(1, "Days must be at least 1"),
  budget: z.number().min(0, "Budget must be non-negative"),
  paymentTerms: z.enum(["on-complete", "50-50", "25-50-25"]),
  developer: z.string().min(1, "Developer is required"),
  status: z.enum(["ready", "needs-review", "in-progress", "completed"]),
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
