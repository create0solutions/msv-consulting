/**
 * tRPC procedure for uploading business plan PDFs to S3
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

export const uploadRouter = router({
  // Upload a base64-encoded file (PDF) and return its CDN URL
  uploadBusinessPlan: publicProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileBase64: z.string().min(1), // base64 encoded file content
        mimeType: z.string().default("application/pdf"),
      })
    )
    .mutation(async ({ input }) => {
      // Decode base64 to buffer
      const buffer = Buffer.from(input.fileBase64, "base64");

      // Sanitize filename and create unique key
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const timestamp = Date.now();
      const key = `business-plans/${timestamp}-${safeName}`;

      const { url } = await storagePut(key, buffer, input.mimeType);

      return { url, key };
    }),
});
