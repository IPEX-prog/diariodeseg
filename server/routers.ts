import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { uploadToSupabase } from "./supabase";
import { generateChecklistPDF } from "./pdf-generator";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      const { getDashboardStats } = await import("./dashboard");
      return await getDashboardStats(ctx.user.id);
    }),
  }),

  checklist: router({
    // Get all categories with templates
    getCategories: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),

    getTemplates: publicProcedure.query(async () => {
      return await db.getAllTemplates();
    }),

    // Create new checklist
    create: protectedProcedure
      .input(z.object({
        inspectionType: z.enum(["diaria", "semanal", "conforme_necessidade"]),
        inspectionDate: z.date(),
        inspectionTime: z.string(),
        inspectorName: z.string(),
        inspectorRole: z.string(),
        constructionSite: z.string(),
        weatherConditions: z.string().optional(),
        workersCount: z.number().optional(),
        generalObservations: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const checklistId = await db.createChecklist({
          userId: ctx.user.id,
          ...input,
          status: "em_andamento",
        });
        return { checklistId };
      }),

    // Get user's checklists
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getChecklistsByUser(ctx.user.id);
    }),

    // Get checklist by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const checklist = await db.getChecklistById(input.id);
        if (!checklist) throw new Error("Checklist not found");
        
        const items = await db.getChecklistItems(input.id);
        const itemsWithPhotos = await Promise.all(
          items.map(async (item) => ({
            ...item,
            photos: await db.getPhotosByItem(item.id),
          }))
        );
        
        return {
          ...checklist,
          items: itemsWithPhotos,
        };
      }),

    // Update checklist
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          inspectionType: z.enum(["diaria", "semanal", "conforme_necessidade"]).optional(),
          inspectorName: z.string().optional(),
          inspectorRole: z.string().optional(),
          constructionSite: z.string().optional(),
          weatherConditions: z.string().optional(),
          workersCount: z.number().optional(),
          generalObservations: z.string().optional(),
          status: z.enum(["em_andamento", "concluido"]).optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await db.updateChecklist(input.id, input.data);
        return { success: true };
      }),

    // Export to PDF
    exportPDF: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const checklist = await db.getChecklistById(input.id);
        if (!checklist) throw new Error("Checklist not found");
        
        const items = await db.getChecklistItems(input.id);
        const itemsWithPhotos = await Promise.all(
          items.map(async (item) => ({
            ...item,
            photos: await db.getPhotosByItem(item.id),
          }))
        );
        
        const categories = await db.getAllCategories();
        const templates = await db.getAllTemplates();
        
        const categoriesWithTemplates = categories.map(cat => ({
          ...cat,
          templates: templates.filter(t => t.categoryId === cat.id),
        }));
        
        const pdfBuffer = await generateChecklistPDF(
          { ...checklist, items: itemsWithPhotos },
          categoriesWithTemplates
        );
        
        // Upload PDF to Supabase
        const fileName = `checklist-${checklist.constructionSite.replace(/\s+/g, '-')}-${new Date(checklist.inspectionDate).toISOString().split('T')[0]}.pdf`;
        const filePath = `checklist-pdfs/${input.id}/${Date.now()}-${fileName}`;
        
        const { url } = await uploadToSupabase(
          'checklist-pdfs',
          filePath,
          pdfBuffer,
          'application/pdf'
        );
        
        return { url, fileName };
      }),

    // Delete checklist
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteChecklist(input.id);
        return { success: true };
      }),

    // Checklist items
    item: router({
      create: protectedProcedure
        .input(z.object({
          checklistId: z.number(),
          templateId: z.number(),
          status: z.enum(["conforme", "nao_conforme", "nao_aplicavel"]).optional(),
          observations: z.string().optional(),
          correctiveAction: z.string().optional(),
          responsible: z.string().optional(),
          deadline: z.date().optional(),
        }))
        .mutation(async ({ input }) => {
          const itemId = await db.createChecklistItem(input);
          return { itemId };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            status: z.enum(["conforme", "nao_conforme", "nao_aplicavel"]).optional(),
            observations: z.string().optional(),
            correctiveAction: z.string().optional(),
            responsible: z.string().optional(),
            deadline: z.date().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          await db.updateChecklistItem(input.id, input.data);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteChecklistItem(input.id);
          return { success: true };
        }),
    }),

    // Photos
    photo: router({
      upload: protectedProcedure
        .input(z.object({
          checklistItemId: z.number(),
          fileData: z.string(), // base64 encoded
          fileName: z.string(),
          mimeType: z.string(),
          caption: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          // Decode base64 to buffer
          const buffer = Buffer.from(input.fileData, 'base64');
          
          // Generate unique file path
          const timestamp = Date.now();
          const randomSuffix = Math.random().toString(36).substring(7);
          const filePath = `checklist-photos/${input.checklistItemId}/${timestamp}-${randomSuffix}-${input.fileName}`;
          
          // Upload to Supabase
          const { url, key } = await uploadToSupabase(
            'checklist-photos',
            filePath,
            buffer,
            input.mimeType
          );
          
          // Save to database
          const photoId = await db.createChecklistPhoto({
            checklistItemId: input.checklistItemId,
            photoUrl: url,
            photoKey: key,
            caption: input.caption,
            mimeType: input.mimeType,
            fileSize: buffer.length,
          });
          
          return { photoId, url, key };
        }),

      create: protectedProcedure
        .input(z.object({
          checklistItemId: z.number(),
          photoUrl: z.string(),
          photoKey: z.string(),
          caption: z.string().optional(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const photoId = await db.createChecklistPhoto(input);
          return { photoId };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deletePhoto(input.id);
          return { success: true };
        }),
    }),

    // EPI Checklist routes
    epi: router({
      create: protectedProcedure
        .input(z.object({
          constructionSite: z.string(),
          inspectionDate: z.date(),
          inspectionTime: z.string(),
          inspectorName: z.string(),
          inspectorRole: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const checklistId = await db.createEPIChecklist({
            userId: ctx.user.id,
            ...input,
            status: "em_andamento",
          });
          return { checklistId };
        }),

      list: protectedProcedure.query(async ({ ctx }) => {
        return await db.getEPIChecklistsByUser(ctx.user.id);
      }),

      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => {
          const checklist = await db.getEPIChecklistById(input.id);
          if (!checklist) throw new Error("EPI Checklist not found");
          
          const items = await db.getEPIItems(input.id);
          return {
            ...checklist,
            items,
          };
        }),

      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          data: z.object({
            status: z.enum(["em_andamento", "concluido"]).optional(),
            constructionSite: z.string().optional(),
            inspectorName: z.string().optional(),
            inspectorRole: z.string().optional(),
          }),
        }))
        .mutation(async ({ input }) => {
          await db.updateEPIChecklist(input.id, input.data);
          return { success: true };
        }),

      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await db.deleteEPIChecklist(input.id);
          return { success: true };
        }),

      exportCSV: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const checklist = await db.getEPIChecklistById(input.id);
          if (!checklist) throw new Error("EPI Checklist not found");
          
          const items = await db.getEPIItems(input.id);
          const { generateEPICSV } = await import("./epi-export");
          const csvContent = generateEPICSV(checklist, items);
          
          return { csvContent };
        }),

      exportPDF: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          const checklist = await db.getEPIChecklistById(input.id);
          if (!checklist) throw new Error("EPI Checklist not found");
          
          const items = await db.getEPIItems(input.id);
          const { generateEPIPDF } = await import("./epi-export");
          const pdfBuffer = await generateEPIPDF(checklist, items);
          
          // Convert buffer to base64 for transmission
          const base64 = pdfBuffer.toString('base64');
          return { pdfBase64: base64 };
        }),

      item: router({
        create: protectedProcedure
          .input(z.object({
            epiChecklistId: z.number(),
            epiName: z.string(),
            ca: z.string(),
            conservationState: z.enum(["novo", "parcialmente_utilizado", "desgaste", "descarte"]).optional(),
            collaboratorName: z.string(),
            observations: z.string().optional(),
          }))
          .mutation(async ({ input }) => {
            const itemId = await db.createEPIItem(input);
            return { itemId };
          }),

        update: protectedProcedure
          .input(z.object({
            id: z.number(),
            data: z.object({
              epiName: z.string().optional(),
              ca: z.string().optional(),
              conservationState: z.enum(["novo", "parcialmente_utilizado", "desgaste", "descarte"]).optional(),
              collaboratorName: z.string().optional(),
              observations: z.string().optional(),
            }),
          }))
          .mutation(async ({ input }) => {
            await db.updateEPIItem(input.id, input.data);
            return { success: true };
          }),

        delete: protectedProcedure
          .input(z.object({ id: z.number() }))
          .mutation(async ({ input }) => {
            await db.deleteEPIItem(input.id);
            return { success: true };
          }),
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
