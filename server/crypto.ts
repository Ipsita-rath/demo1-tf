import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-for-development-only-not-secure';
const ALGORITHM = 'aes-256-gcm';

export class CryptoManager {
  private static instance: CryptoManager;
  private encryptionKey: Buffer;

  private constructor() {
    // In production, use a proper key derivation function
    this.encryptionKey = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  }

  public static getInstance(): CryptoManager {
    if (!CryptoManager.instance) {
      CryptoManager.instance = new CryptoManager();
    }
    return CryptoManager.instance;
  }

  public encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipherGCM(ALGORITHM, this.encryptionKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  public decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipherGCM(ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  public generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public hashPassword(password: string): string {
    const salt = crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    return salt.toString('hex') + ':' + hash.toString('hex');
  }

  public verifyPassword(password: string, hashedPassword: string): boolean {
    const parts = hashedPassword.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const salt = Buffer.from(parts[0], 'hex');
    const hash = Buffer.from(parts[1], 'hex');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
    
    return crypto.timingSafeEqual(hash, verifyHash);
  }
}

export const cryptoManager = CryptoManager.getInstance();