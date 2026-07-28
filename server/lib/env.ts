import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  APP_URL: z.string().url().default('http://localhost:5173'),

  AUTH_JWT_SECRET: z.string().min(32, 'AUTH_JWT_SECRET must be at least 32 characters'),
  AUTH_TOKEN_EXPIRY: z.string().default('24h'),
  SALT_ROUNDS: z.string().default('12'),

  OWNER_EMAIL: z.string().email('OWNER_EMAIL must be a valid email'),
  OWNER_PASSWORD: z.string().min(12, 'OWNER_PASSWORD must be at least 12 characters'),

  DB_PATH: z.string().default('./data/primordex.db'),

  GROQ_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().url().optional(),

  PAYSTACK_SECRET_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env;

export function validateEnv(): Env {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n╔══════════════════════════════════════════╗');
    console.error('║       ENVIRONMENT VALIDATION FAILED      ║');
    console.error('╠══════════════════════════════════════════╣');
    for (const issue of result.error.issues) {
      console.error(`║  ✗ ${issue.path.join('.')}: ${issue.message}`);
    }
    console.error('╠══════════════════════════════════════════╣');
    console.error('║  Copy .env.example to .env and fill in   ║');
    console.error('║  the required values before starting.    ║');
    console.error('╚══════════════════════════════════════════╝\n');
    process.exit(1);
  }

  validatedEnv = result.data;
  return validatedEnv;
}

export function getEnv(): Env {
  if (!validatedEnv) return validateEnv();
  return validatedEnv;
}
