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

  // AWS S3 (optional — app will warn if missing and S3 uploads will be disabled)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET_NAME: z.string().optional(),
  CDN_BASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;