import crypto from 'crypto';

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'default-dev-key-32-chars-long!!!';

// Ensure the key is 32 bytes for AES-256
const getKey = () => {
  if (ENCRYPTION_KEY.length < 32) {
    return Buffer.from(ENCRYPTION_KEY.padEnd(32, '0'));
  }
  return Buffer.from(ENCRYPTION_KEY.slice(0, 32));
};

/**
 * Encrypt sensitive data (tokens, secrets)
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Prepend IV to encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data (tokens, secrets)
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getKey();
    const [ivHex, encrypted] = encryptedText.split(':');

    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipher('aes-256-cbc', key);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Hash data for comparison (non-reversible)
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}