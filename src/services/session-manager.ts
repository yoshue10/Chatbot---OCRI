import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { config } from '../config';
import { UserSession, State } from '../types';
import { logger } from './logger';

export class SessionManager {
  private sessions: Map<string, UserSession> = new Map();

  async load(): Promise<void> {
    try {
      const dir = path.dirname(config.session.filePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      if (existsSync(config.session.filePath)) {
        const data = await readFile(config.session.filePath, 'utf-8');
        const parsed = JSON.parse(data) as Record<string, unknown>[];
        for (const item of parsed) {
          const session: UserSession = {
            ...item as unknown as UserSession,
            createdAt: new Date((item as Record<string, string>).createdAt),
            updatedAt: new Date((item as Record<string, string>).updatedAt),
          };
          this.sessions.set(session.userId, session);
        }
        logger.info(`Sessions loaded: ${this.sessions.size}`);
      }
    } catch (error) {
      logger.error({ error }, 'Failed to load sessions');
    }
  }

  async save(): Promise<void> {
    try {
      const dir = path.dirname(config.session.filePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      const data = JSON.stringify(Array.from(this.sessions.values()), null, 2);
      await writeFile(config.session.filePath, data, 'utf-8');
    } catch (error) {
      logger.error({ error }, 'Failed to save sessions');
    }
  }

  getSession(userId: string): UserSession {
    const existing = this.sessions.get(userId);
    if (existing) return existing;

    const newSession: UserSession = {
      userId,
      state: State.WELCOME,
      context: {},
      log: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(userId, newSession);
    return newSession;
  }

  updateSession(userId: string, updates: Partial<UserSession>): UserSession {
    const session = this.getSession(userId);
    const updated: UserSession = {
      ...session,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(userId, updated);
    return updated;
  }

  clearSession(userId: string): void {
    this.sessions.delete(userId);
  }

  getAllSessions(): Map<string, UserSession> {
    return this.sessions;
  }
}

export const sessionManager = new SessionManager();
