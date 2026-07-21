import { config } from './config';
import { logger } from './services/logger';
import { sessionManager } from './services/session-manager';
import { NotifierManager } from './notifiers/NotifierManager';
import { ConsoleNotifier } from './notifiers/ConsoleNotifier';
import { WhatsAppNotifier } from './notifiers/WhatsAppNotifier';
import { WhatsAppBot } from './bot/WhatsAppBot';
import { MessageController } from './controllers/message-controller';

async function main(): Promise<void> {
  logger.info('Starting WhatsApp Bot UNCP - Cooperación y Relaciones Internacionales');

  await sessionManager.load();

  const notifierManager = new NotifierManager();
  notifierManager.addNotifier(new ConsoleNotifier());

  const messageController = new MessageController(notifierManager);
  const bot = new WhatsAppBot(messageController);

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await sessionManager.save();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    await sessionManager.save();
    process.exit(0);
  });

  await bot.initialize();

  const ADMIN_JID = '51977529746@s.whatsapp.net';
  notifierManager.addNotifier(new WhatsAppNotifier(() => bot.getSock(), ADMIN_JID));
  logger.info({ adminJid: ADMIN_JID }, 'WhatsApp Notifier registrado');

  logger.info({ prefix: config.bot.prefix }, 'Bot is ready');
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});
