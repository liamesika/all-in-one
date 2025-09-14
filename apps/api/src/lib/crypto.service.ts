import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { EnvService } from './env.service';

export interface EncryptedPayload {
  iv: string;
  ciphertext: string;
  tag: string;
}

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 12; // 96 bits for GCM
  private readonly tagLength = 16; // 128 bits

  constructor(private readonly envService: EnvService) {}

  private getEncryptionKey(): Buffer {
    const key = this.envService.get('TOKEN_CRYPTO_KEY');
    try {
      const decoded = Buffer.from(key, 'base64');
      if (decoded.length !== this.keyLength) {
        throw new Error(`Invalid key length: expected ${this.keyLength} bytes, got ${decoded.length} bytes`);
      }
      return decoded;
    } catch (error) {
      this.logger.error('Failed to decode TOKEN_CRYPTO_KEY - must be base64-encoded 32-byte key');
      throw new Error('Invalid TOKEN_CRYPTO_KEY format');
    }
  }

  /**
   * Encrypt token using AES-256-GCM
   * Returns base64-encoded components
   */
  encryptToken(plaintext: string): EncryptedPayload {
    try {
      if (!plaintext || typeof plaintext !== 'string') {
        throw new Error('Invalid plaintext input');
      }

      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      cipher.setAAD(Buffer.from('platform-integrations', 'utf8'));

      let ciphertext = cipher.update(plaintext, 'utf8');
      ciphertext = Buffer.concat([ciphertext, cipher.final()]);

      const tag = cipher.getAuthTag();

      return {
        iv: iv.toString('base64'),
        ciphertext: ciphertext.toString('base64'),
        tag: tag.toString('base64')
      };
    } catch (error) {
      // Log for debugging but preserve original error message
      this.logger.error('Token encryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Decrypt token using AES-256-GCM
   */
  decryptToken(payload: EncryptedPayload): string {
    try {
      if (!payload || !payload.iv || !payload.ciphertext || !payload.tag) {
        throw new Error('Invalid encrypted payload format');
      }

      const key = this.getEncryptionKey();
      const iv = Buffer.from(payload.iv, 'base64');
      const ciphertext = Buffer.from(payload.ciphertext, 'base64');
      const tag = Buffer.from(payload.tag, 'base64');

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAAD(Buffer.from('platform-integrations', 'utf8'));
      decipher.setAuthTag(tag);

      let plaintext = decipher.update(ciphertext, undefined, 'utf8');
      plaintext += decipher.final('utf8');

      return plaintext;
    } catch (error) {
      // Log for debugging but preserve original error message for validation/auth failures
      this.logger.error('Token decryption failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Legacy encrypt method for backward compatibility (AES-256-CBC)
   */
  encrypt(plaintext: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(16); // 128-bit IV for CBC

      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Format: iv:encrypted
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Legacy encryption failed', { error: error.message });
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Legacy decrypt method for backward compatibility (AES-256-CBC)
   */
  decrypt(encryptedData: string): string {
    try {
      const key = this.getEncryptionKey();
      const parts = encryptedData.split(':');

      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Legacy decryption failed', { error: error.message });
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate a secure random string for state parameters
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data for comparison (one-way)
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Verify if encrypted token is valid (doesn't decrypt, just validates format)
   */
  isValidEncryptedFormat(encryptedData: string): boolean {
    try {
      const parts = encryptedData.split(':');
      return parts.length === 2 &&
             parts.every(part => /^[a-f0-9]+$/i.test(part));
    } catch {
      return false;
    }
  }
}