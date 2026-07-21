import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import path from 'path';
import { rm } from 'fs/promises';
import { existsSync } from 'fs';
import { MessageController } from '../controllers/message-controller';
import { MessageQueue } from '../services/message-queue';
import { logger } from '../services/logger';

export class WhatsAppBot {
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private messageController: MessageController;
  private messageQueue: MessageQueue;
  private authPath: string;
  private reconnectTimeout: number = 1000;

  constructor(messageController: MessageController) {
    this.messageController = messageController;
    this.authPath = path.join(__dirname, '../../auth_info');
    this.messageQueue = new MessageQueue(
      async (userId: string, message: unknown) => {
        if (!this.sock) {
          logger.warn({ userId }, 'Socket not initialized, skipping');
          return;
        }
        const data = message as { text: string; fromMe: boolean };
        await this.messageController.handleMessage(
          this.sock,
          userId,
          data.text,
          data.fromMe,
        );
      },
    );
  }

  async initialize(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

    this.sock = makeWASocket({
      auth: state,
      syncFullHistory: false,
      emitOwnEvents: true,
    });

    this.sock.ev.on('creds.update', saveCreds);
    this.sock.ev.on('connection.update', this.handleConnectionUpdate.bind(this));
    this.sock.ev.on('messages.upsert', this.handleMessagesUpsert.bind(this));

    logger.info('WhatsApp bot initialized');
  }

  private async handleConnectionUpdate(update: any): Promise<void> {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
      logger.info('QR code generated — scan with WhatsApp to authenticate');
      return;
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      if (isLoggedOut) {
        logger.info('Logged out — cleaning auth and restarting for new QR');
        await this.cleanAuth();
        this.reconnectTimeout = 1000;
        await this.initialize();
        return;
      }

      logger.info(
        { statusCode, reconnectAfter: this.reconnectTimeout },
        'Connection closed — reconnecting',
      );

      await this.delay(this.reconnectTimeout);
      this.reconnectTimeout = Math.min(this.reconnectTimeout * 2, 30000);
      await this.initialize();
    }

    if (connection === 'open') {
      this.reconnectTimeout = 1000;
      logger.info('WhatsApp connection established');
    }
  }

  private async cleanAuth(): Promise<void> {
    this.sock = null;
    if (existsSync(this.authPath)) {
      await rm(this.authPath, { recursive: true, force: true });
      logger.info('Auth credentials cleaned');
    }
  }

  getSock(): ReturnType<typeof makeWASocket> | null {
    return this.sock;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async handleMessagesUpsert({ messages }: { messages: any[] }): Promise<void> {
    for (const msg of messages) {
      try {
        const jid = msg.key.remoteJid;

        if (!jid) continue;

        if (jid.includes('@g.us') || jid.includes('@broadcast') || jid.includes('@status')) {
          continue;
        }

        const messageText =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.buttonsResponseMessage?.selectedButtonId ||
          msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
          '';

        if (!messageText.trim()) {
          logger.debug({ jid, type: Object.keys(msg.message || {})[0] }, 'Non-text message ignored');
          continue;
        }

        logger.info({ userId: jid, message: messageText, fromMe: msg.key.fromMe }, 'Message received');
        this.messageQueue.enqueue(jid, { text: messageText, fromMe: msg.key.fromMe });
      } catch (error) {
        logger.error({ error }, 'Error processing incoming message');
      }
    }
  }
}
