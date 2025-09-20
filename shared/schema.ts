import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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
