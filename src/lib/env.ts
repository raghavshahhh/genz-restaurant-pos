/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at application startup
 * Fails fast if configuration is invalid to prevent runtime errors
 */

import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Application
  TAX_RATE: z.string().regex(/^\d+(\.\d+)?$/, 'TAX_RATE must be a decimal number (e.g., 0.18)'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed configuration
 * @throws {Error} If validation fails with detailed error messages
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      TAX_RATE: process.env.TAX_RATE,
      NODE_ENV: process.env.NODE_ENV,
    });
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: any) => `- ${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(
        `❌ Invalid environment variables:\n${errorMessages}\n\nPlease check your .env file.`
      );
    }
    throw error;
  }
}

/**
 * Validated and typed environment configuration
 * Use this instead of process.env for type safety
 */
export const env = validateEnv();
