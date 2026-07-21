import { WASocket } from '@whiskeysockets/baileys';
import { config } from '../config';
import { BotMessage } from '../types';
import { logger } from '../services/logger';

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendHumanMessage(
  sock: WASocket,
  userId: string,
  messages: BotMessage[],
): Promise<void> {
  for (const msg of messages) {
    const typingDuration = randomDelay(
      config.bot.typingMinDelay,
      config.bot.typingMaxDelay,
    );

    if (msg.typing !== false) {
      try {
        await sock.sendPresenceUpdate('composing', userId);
      } catch (error) {
        logger.debug({ error, userId }, 'Failed to send typing indicator');
      }
    }

    await delay(typingDuration);

    try {
      if (msg.file) {
        await sock.sendMessage(userId, {
          image: { url: msg.file.url },
          caption: msg.file.caption || '',
        });
        await delay(config.bot.fileDelay);
      } else {
        await sock.sendMessage(userId, {
          text: msg.text || '',
        });
      }
    } catch (error) {
      logger.error({ error, userId }, 'Failed to send message');
      throw error;
    } finally {
      try {
        await sock.sendPresenceUpdate('paused', userId);
      } catch {
      }
    }
  }
}
