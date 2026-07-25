import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_KEY || 'default-secret-key-must-be-32-chars-long!';
    // Scrypt is synchronous, but only runs once on startup
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedText: string): string | null {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        return null; // Not encrypted with this format
      }
      const [ivHex, authTagHex, encryptedHex] = parts;
      
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.key,
        Buffer.from(ivHex, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
      
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (e) {
      return null;
    }
  }
}
