import { Alert } from '../types';

export interface INotifier {
  sendAlert(alert: Alert): Promise<void>;
}
