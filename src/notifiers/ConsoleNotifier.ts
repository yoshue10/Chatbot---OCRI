import { INotifier } from './INotifier';
import { Alert } from '../types';
import { logger } from '../services/logger';

export class ConsoleNotifier implements INotifier {
  async sendAlert(alert: Alert): Promise<void> {
    logger.info({
      type: 'HUMAN_ASSISTANCE_REQUEST',
      ...alert,
    }, 'Alerta de atención humana');
  }
}
