export enum State {
  WELCOME = 'WELCOME',
  SELECT_COMMUNITY = 'SELECT_COMMUNITY',
  SELECT_ROLE = 'SELECT_ROLE',
  SELECT_EXCHANGE = 'SELECT_EXCHANGE',
  SHOW_MENU = 'SHOW_MENU',
  WAITING_HUMAN = 'WAITING_HUMAN',
  ATENCION_HUMANA = 'ATENCION_HUMANA',
  FINISHED = 'FINISHED',
}

export interface LogEntry {
  state: State;
  input: string;
  timestamp: string;
}

export interface UserSession {
  userId: string;
  state: State;
  context: Record<string, unknown>;
  log: LogEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Transition {
  nextState: State;
  messages: string[];
  files?: { url: string; caption?: string }[];
  context?: Record<string, unknown>;
}

export interface Alert {
  userNumber: string;
  date: string;
  time: string;
  status: string;
  message?: string;
  conversationLog?: LogEntry[];
}

export interface QueueItem {
  userId: string;
  message: unknown;
}

export interface BotMessage {
  text?: string;
  file?: { url: string; caption?: string };
  typing?: boolean;
}

export type SendMessageFn = (userId: string, messages: BotMessage[]) => Promise<void>;
