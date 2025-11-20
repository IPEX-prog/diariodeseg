import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { checklists, checklistItems, epiChecklists, epiItems } from "../drizzle/schema";

export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Get all checklists for user
    const userChecklists = await db.select().from(checklists).where(eq(checklists.userId, userId));
    const userEPIChecklists = await db.select().from(epiChecklists).where(eq(epiChecklists.userId, userId));

    // Count by construction site
    const checklistsByConstruction: Record<string, { total: number; completed: number; nonConformities: number }> = {};
    const epiByConstruction: Record<string, { total: number; byState: Record<string, number> }> = {};

    // Process checklists
    for (const checklist of userChecklists) {
      const items = await db.select().from(checklistItems).where(eq(checklistItems.checklistId, checklist.id));
      const nonConformities = items.filter(item => item.status === "nao_conforme").length;

      if (!checklistsByConstruction[checklist.constructionSite]) {
        checklistsByConstruction[checklist.constructionSite] = { total: 0, completed: 0, nonConformities: 0 };
      }

      checklistsByConstruction[checklist.constructionSite].total++;
      if (checklist.status === "concluido") {
        checklistsByConstruction[checklist.constructionSite].completed++;
      }
      checklistsByConstruction[checklist.constructionSite].nonConformities += nonConformities;
    }

    // Process EPI checklists
    for (const epiChecklist of userEPIChecklists) {
      const items = await db.select().from(epiItems).where(eq(epiItems.epiChecklistId, epiChecklist.id));

      if (!epiByConstruction[epiChecklist.constructionSite]) {
        epiByConstruction[epiChecklist.constructionSite] = { total: 0, byState: {} };
      }

      epiByConstruction[epiChecklist.constructionSite].total += items.length;

      for (const item of items) {
        const state = item.conservationState || "novo";
        if (!epiByConstruction[epiChecklist.constructionSite].byState[state]) {
          epiByConstruction[epiChecklist.constructionSite].byState[state] = 0;
        }
        epiByConstruction[epiChecklist.constructionSite].byState[state]++;
      }
    }

    return {
      totalChecklists: userChecklists.length,
      totalEPIChecklists: userEPIChecklists.length,
      completedChecklists: userChecklists.filter(c => c.status === "concluido").length,
      checklistsByConstruction,
      epiByConstruction,
      totalNonConformities: Object.values(checklistsByConstruction).reduce((sum, c) => sum + c.nonConformities, 0),
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return null;
  }
}
