import { QueueItem } from '../types';
import { logger } from './logger';

type MessageHandler = (userId: string, message: unknown) => Promise<void>;

export class MessageQueue {
  private queues: Map<string, QueueItem[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private handler: MessageHandler;

  constructor(handler: MessageHandler) {
    this.handler = handler;
  }

  enqueue(userId: string, message: unknown): void {
    if (!this.queues.has(userId)) {
      this.queues.set(userId, []);
    }
    this.queues.get(userId)!.push({ userId, message });
    logger.debug({ userId, queueLength: this.queues.get(userId)!.length }, 'Message enqueued');

    if (!this.processing.get(userId)) {
      setImmediate(() => this.processNext(userId));
    }
  }

  private async processNext(userId: string): Promise<void> {
    if (this.processing.get(userId)) return;

    this.processing.set(userId, true);
    const queue = this.queues.get(userId) || [];

    try {
      while (queue.length > 0) {
        const item = queue.shift()!;
        try {
          await this.handler(item.userId, item.message);
        } catch (error) {
          logger.error({ error, userId }, 'Error processing message');
        }
        await this.delay(100);
      }
    } finally {
      this.processing.set(userId, false);
      this.queues.delete(userId);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getQueueLength(userId: string): number {
    return this.queues.get(userId)?.length || 0;
  }

  isProcessing(userId: string): boolean {
    return this.processing.get(userId) || false;
  }
}
