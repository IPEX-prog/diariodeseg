import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Checklists de segurança
 */
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Informações da inspeção
  inspectionType: mysqlEnum("inspectionType", ["diaria", "semanal", "conforme_necessidade"]).notNull(),
  inspectionDate: timestamp("inspectionDate").notNull(),
  inspectionTime: varchar("inspectionTime", { length: 5 }).notNull(), // HH:MM
  
  // Informações do responsável
  inspectorName: varchar("inspectorName", { length: 255 }).notNull(),
  inspectorRole: varchar("inspectorRole", { length: 255 }).notNull(),
  
  // Informações da obra
  constructionSite: varchar("constructionSite", { length: 255 }).notNull(),
  weatherConditions: varchar("weatherConditions", { length: 100 }),
  workersCount: int("workersCount"),
  
  // Observações gerais
  generalObservations: text("generalObservations"),
  
  // Status
  status: mysqlEnum("status", ["em_andamento", "concluido"]).default("em_andamento").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

/**
 * Categorias de itens do checklist (baseado em PBQP-H e NR-18)
 */
export const checklistCategories = mysqlTable("checklistCategories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistCategory = typeof checklistCategories.$inferSelect;
export type InsertChecklistCategory = typeof checklistCategories.$inferInsert;

/**
 * Itens padrão do checklist (template)
 */
export const checklistItemTemplates = mysqlTable("checklistItemTemplates", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  question: text("question").notNull(),
  orderIndex: int("orderIndex").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistItemTemplate = typeof checklistItemTemplates.$inferSelect;
export type InsertChecklistItemTemplate = typeof checklistItemTemplates.$inferInsert;

/**
 * Respostas dos itens do checklist
 */
export const checklistItems = mysqlTable("checklistItems", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").notNull(),
  templateId: int("templateId").notNull(),
  
  // Resposta
  status: mysqlEnum("status", ["conforme", "nao_conforme", "nao_aplicavel"]),
  observations: text("observations"),
  
  // Ações corretivas (se não conforme)
  correctiveAction: text("correctiveAction"),
  responsible: varchar("responsible", { length: 255 }),
  deadline: timestamp("deadline"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = typeof checklistItems.$inferInsert;

/**
 * Fotos anexadas aos itens do checklist
 */
export const checklistPhotos = mysqlTable("checklistPhotos", {
  id: int("id").autoincrement().primaryKey(),
  checklistItemId: int("checklistItemId").notNull(),
  
  // Armazenamento (Supabase)
  photoUrl: text("photoUrl").notNull(),
  photoKey: varchar("photoKey", { length: 500 }).notNull(),
  
  // Metadados
  caption: text("caption"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistPhoto = typeof checklistPhotos.$inferSelect;
export type InsertChecklistPhoto = typeof checklistPhotos.$inferInsert;
