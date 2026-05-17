import { z } from "zod";

const supabaseAdminEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
});

const openAiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini")
});

const cronEnvSchema = z.object({
  CRON_SECRET: z.string().min(1)
});

const reviewEnvSchema = z.object({
  ADMIN_REVIEW_REQUIRED: z.enum(["true", "false"]).default("false")
});

export function supabaseAdminEnv() {
  return supabaseAdminEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });
}

export function openAiEnv() {
  return openAiEnvSchema.parse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_MODEL: process.env.OPENAI_MODEL
  });
}

export function cronEnv() {
  return cronEnvSchema.parse({
    CRON_SECRET: process.env.CRON_SECRET
  });
}

export function reviewEnv() {
  return reviewEnvSchema.parse({
    ADMIN_REVIEW_REQUIRED: process.env.ADMIN_REVIEW_REQUIRED
  });
}
