import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
  company: text("company"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const terraformConfigurations = pgTable("terraform_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  resources: json("resources").notNull(),
  generatedCode: text("generated_code"),
  deploymentStatus: text("deployment_status").default("draft"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  configurationId: integer("configuration_id").references(() => terraformConfigurations.id),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull(),
  terraformPlanId: text("terraform_plan_id"),
  terraformApplyId: text("terraform_apply_id"),
  logs: json("logs").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User sessions table for secure session management
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Secure storage for connection strings and tokens
export const secureStorage = pgTable("secure_storage", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  key: text("key").notNull(), // e.g., 'terraform_cloud_token', 'azure_connection_string'
  encryptedValue: text("encrypted_value").notNull(),
  type: text("type").notNull(), // 'token', 'connection_string', 'api_key'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Application settings and preferences
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  key: text("key").notNull(),
  value: json("value").notNull(),
  category: text("category").default("general"), // 'general', 'ui', 'security', 'terraform'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit log for security monitoring
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // 'login', 'configuration_created', 'deployment_started'
  details: json("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTerraformConfigurationSchema = createInsertSchema(terraformConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecureStorageSchema = createInsertSchema(secureStorage).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type TerraformConfiguration = typeof terraformConfigurations.$inferSelect;
export type InsertTerraformConfiguration = z.infer<typeof insertTerraformConfigurationSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type SecureStorage = typeof secureStorage.$inferSelect;
export type InsertSecureStorage = z.infer<typeof insertSecureStorageSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
