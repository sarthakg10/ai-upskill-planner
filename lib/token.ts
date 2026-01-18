import crypto from 'crypto';

/**
 * Generate a unique 32-character token for plan access
 * Uses crypto.randomBytes for security
 */
export function generateToken(): string {
  return crypto.randomBytes(16).toString('hex');
}
