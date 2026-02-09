import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GOOGLE_GEMINI_API_KEY: z.string().min(1).optional(),
  PERPLEXITY_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

function getEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = getEnv();

export type ActivePlatform = "OPENAI" | "ANTHROPIC" | "GEMINI" | "PERPLEXITY";

export function getActivePlatforms(): ActivePlatform[] {
  const platforms: ActivePlatform[] = [];
  if (env.OPENAI_API_KEY) platforms.push("OPENAI");
  if (env.ANTHROPIC_API_KEY) platforms.push("ANTHROPIC");
  if (env.GOOGLE_GEMINI_API_KEY) platforms.push("GEMINI");
  if (env.PERPLEXITY_API_KEY) platforms.push("PERPLEXITY");
  return platforms;
}
