import { INotifier } from './INotifier';
import { Alert, State } from '../types';
import { WASocket } from '@whiskeysockets/baileys';
import { logger } from '../services/logger';

const STATE_LABELS: Record<string, string> = {
  [State.WELCOME]: 'Inicio de conversación',
  [State.SELECT_COMMUNITY]: 'Selección de comunidad (UNCP/Externo)',
  [State.SELECT_ROLE]: 'Selección de rol',
  [State.SELECT_EXCHANGE]: 'Selección de tipo de intercambio',
  [State.SHOW_MENU]: 'Menú de opciones',
  [State.WAITING_HUMAN]: 'Solicitó asesor humano',
  [State.FINISHED]: 'Conversación finalizada',
};

function formatConversationLog(log: { state: string; input: string; timestamp: string }[]): string {
  if (!log || log.length === 0) return '*(Sin interacciones previas)*';

  return log.map((entry, i) => {
    const stateLabel = STATE_LABELS[entry.state] || entry.state;
    const input = entry.input || '(inicio)';
    return `  ${i + 1}. *${stateLabel}*\n     ➡ Usuario: "${input}"`;
  }).join('\n\n');
}

export class WhatsAppNotifier implements INotifier {

  constructor(
    private getSock: () => WASocket | null,
    private adminJid: string,
  ) {}

  async sendAlert(alert: Alert): Promise<void> {
    const sock = this.getSock();
    if (!sock) {
      logger.warn({ adminJid: this.adminJid }, 'Socket no disponible para enviar alerta');
      return;
    }

    const contextBlock = alert.conversationLog
      ? '📋 *Historial de la conversación:*\n\n' + formatConversationLog(alert.conversationLog)
      : '';

    try {
      await sock.sendMessage(this.adminJid, {
        text: '🔔 *Alerta de Atención Humana*\n\n' +
              `👤 *Usuario:* ${alert.userNumber}\n` +
              `📅 *Fecha:* ${alert.date}\n` +
              `⏰ *Hora:* ${alert.time}\n` +
              `📌 *Estado:* ${alert.status}\n\n` +
              `${contextBlock}\n\n` +
              '⚠️ _El usuario requiere asistencia manual._',
      });
      logger.info({ adminJid: this.adminJid }, 'Alerta enviada al admin por WhatsApp');
    } catch (error) {
      logger.error({ error }, 'Error al enviar alerta por WhatsApp');
    }
  }
}