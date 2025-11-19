import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  checklists,
  checklistCategories,
  checklistItemTemplates,
  checklistItems,
  checklistPhotos,
  type Checklist,
  type InsertChecklist,
  type ChecklistItem,
  type InsertChecklistItem,
  type ChecklistPhoto,
  type InsertChecklistPhoto
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Checklist functions

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(checklistCategories).orderBy(checklistCategories.orderIndex);
}

export async function getTemplatesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(checklistItemTemplates)
    .where(eq(checklistItemTemplates.categoryId, categoryId))
    .orderBy(checklistItemTemplates.orderIndex);
}

export async function getAllTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(checklistItemTemplates).orderBy(checklistItemTemplates.orderIndex);
}

export async function createChecklist(data: InsertChecklist) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(checklists).values(data);
  return result[0].insertId;
}

export async function getChecklistsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(checklists)
    .where(eq(checklists.userId, userId))
    .orderBy(desc(checklists.createdAt));
}

export async function getChecklistById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(checklists).where(eq(checklists.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateChecklist(id: number, data: Partial<InsertChecklist>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(checklists).set(data).where(eq(checklists.id, id));
}

export async function deleteChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete related items and photos first
  const items = await getChecklistItems(id);
  for (const item of items) {
    await deleteChecklistItem(item.id);
  }
  
  await db.delete(checklists).where(eq(checklists.id, id));
}

// Checklist items

export async function createChecklistItem(data: InsertChecklistItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(checklistItems).values(data);
  return result[0].insertId;
}

export async function getChecklistItems(checklistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(checklistItems)
    .where(eq(checklistItems.checklistId, checklistId));
}

export async function updateChecklistItem(id: number, data: Partial<InsertChecklistItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(checklistItems).set(data).where(eq(checklistItems.id, id));
}

export async function deleteChecklistItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete photos first
  await db.delete(checklistPhotos).where(eq(checklistPhotos.checklistItemId, id));
  await db.delete(checklistItems).where(eq(checklistItems.id, id));
}

// Photos

export async function createChecklistPhoto(data: InsertChecklistPhoto) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(checklistPhotos).values(data);
  return result[0].insertId;
}

export async function getPhotosByItem(itemId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(checklistPhotos)
    .where(eq(checklistPhotos.checklistItemId, itemId));
}

export async function deletePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(checklistPhotos).where(eq(checklistPhotos.id, id));
}
