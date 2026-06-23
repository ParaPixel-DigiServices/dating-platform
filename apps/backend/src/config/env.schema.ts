import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum([
    'development',
    'production',
    'test',
  ]),

  PORT: z.coerce.number().int().positive(),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),

  JWT_REFRESH_SECRET: z.string().min(32),

  FIREBASE_PROJECT_ID: z.string(),

  CORS_ORIGIN: z.string(),

  THROTTLE_TTL: z.coerce.number().int().positive(),

  THROTTLE_LIMIT: z.coerce.number().int().positive(),
});

export type Env = z.infer<typeof envSchema>;