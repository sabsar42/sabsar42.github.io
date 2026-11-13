import { z } from "zod";

export const ContactSchema = z
  .object({
    message: z.string().trim().min(2, "Write a message first.").max(2000, "Keep it under 2,000 characters."),
    anonymous: z.boolean(),
    name: z.string().trim().max(80).optional().default(""),
    email: z.string().trim().max(200).optional().default(""),
    /** Honeypot: real visitors never see or fill this. */
    website: z.string().max(0).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (!v.anonymous && !z.string().email().safeParse(v.email).success) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Add a valid email so he can reply, or send anonymously." });
    }
  });

export type ContactInput = z.input<typeof ContactSchema>;
export type ContactErrorCode = "not_configured" | "invalid" | "rate_limited" | "upstream" | "network";
