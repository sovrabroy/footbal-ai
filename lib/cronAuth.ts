import { NextRequest } from 'next/server';

/**
 * Validates CRON authorization header or secret key
 */
export function validateCronAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is not set, allow requests (useful during development/preview)
  if (!cronSecret) {
    return true;
  }

  // Check Bearer Token in Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    if (token === cronSecret) return true;
  }

  // Check ?key= query parameter
  const url = new URL(req.url);
  const keyParam = url.searchParams.get('key');
  if (keyParam === cronSecret) {
    return true;
  }

  return false;
}

/**
 * Generates a high-entropy random CRON secret string
 */
export function generateRandomCronSecret(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'gp_cron_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

