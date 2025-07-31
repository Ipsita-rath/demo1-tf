import { storage } from './storage';
import { cryptoManager } from './crypto';
import type { User, InsertUserSession, UserSession } from '@shared/schema';

export class SessionManager {
  private static instance: SessionManager;
  private sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public async createSession(user: User): Promise<string> {
    const sessionToken = cryptoManager.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.sessionDuration);

    const sessionData: InsertUserSession = {
      userId: user.id,
      sessionToken,
      expiresAt,
    };

    await storage.createSession(sessionData);

    // Log the session creation
    await storage.logAuditEvent({
      userId: user.id,
      action: 'session_created',
      details: { sessionToken: sessionToken.substring(0, 8) + '...' },
      ipAddress: null,
      userAgent: null,
    });

    return sessionToken;
  }

  public async validateSession(sessionToken: string): Promise<User | null> {
    const session = await storage.getSession(sessionToken);
    
    if (!session) {
      return null;
    }

    const user = await storage.getUser(session.userId);
    
    if (!user) {
      // Clean up orphaned session
      await storage.deleteSession(sessionToken);
      return null;
    }

    return user;
  }

  public async destroySession(sessionToken: string): Promise<boolean> {
    const session = await storage.getSession(sessionToken);
    
    if (session) {
      await storage.logAuditEvent({
        userId: session.userId,
        action: 'session_destroyed',
        details: { sessionToken: sessionToken.substring(0, 8) + '...' },
        ipAddress: null,
        userAgent: null,
      });
    }

    return await storage.deleteSession(sessionToken);
  }

  public async cleanupExpiredSessions(): Promise<void> {
    await storage.cleanupExpiredSessions();
  }

  public async refreshSession(sessionToken: string): Promise<string | null> {
    const session = await storage.getSession(sessionToken);
    
    if (!session) {
      return null;
    }

    // Destroy old session
    await storage.deleteSession(sessionToken);
    
    // Create new session
    const user = await storage.getUser(session.userId);
    if (!user) {
      return null;
    }

    return await this.createSession(user);
  }
}

export const sessionManager = SessionManager.getInstance();

// Cleanup expired sessions every hour
setInterval(() => {
  sessionManager.cleanupExpiredSessions();
}, 60 * 60 * 1000);