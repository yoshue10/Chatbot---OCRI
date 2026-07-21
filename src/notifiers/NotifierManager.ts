import { INotifier } from './INotifier';
import { Alert } from '../types';
import { logger } from '../services/logger';

export class NotifierManager implements INotifier {
  private notifiers: INotifier[] = [];

  addNotifier(notifier: INotifier): void {
    this.notifiers.push(notifier);
  }

  removeNotifier(notifier: INotifier): void {
    const index = this.notifiers.indexOf(notifier);
    if (index >= 0) {
      this.notifiers.splice(index, 1);
    }
  }

  async sendAlert(alert: Alert): Promise<void> {
    const results = await Promise.allSettled(
      this.notifiers.map((n) => n.sendAlert(alert)),
    );

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        logger.error(
          { error: result.reason, notifierIndex: i },
          'Notifier failed to send alert',
        );
      }
    }
  }
}
