import { WASocket } from '@whiskeysockets/baileys';
import { processState } from '../flows/state-machine';
import { sessionManager } from '../services/session-manager';
import { sendHumanMessage } from '../utils/human-sender';
import { NotifierManager } from '../notifiers/NotifierManager';
import { logger } from '../services/logger';
import { State, BotMessage, LogEntry } from '../types';

const SESSION_EXPIRY_MS = 15 * 60 * 1000;
const HUMAN_CARE_EXPIRY_MS = 24 * 60 * 60 * 1000;

const CIERRE_FRASES = [
  'hasta luego',
  'que tenga un buen día',
  'que tenga buen día',
  'gracias por comunicarte con la ocri',
  'gracias por comunicarse con la ocri',
  'quedamos atentos',
  'saludos cordiales',
  'adios',
];

function isSessionExpired(session: { updatedAt: Date }): boolean {
  return Date.now() - new Date(session.updatedAt).getTime() > SESSION_EXPIRY_MS;
}

function esFraseDeCierre(texto: string): boolean {
  const lower = texto.toLowerCase().trim();
  return CIERRE_FRASES.some((frase) => lower.includes(frase));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MessageController {
  private notifierManager: NotifierManager;

  constructor(notifierManager: NotifierManager) {
    this.notifierManager = notifierManager;
  }

  async handleMessage(
    sock: WASocket,
    userId: string,
    messageText: string,
    isFromMe: boolean = false,
  ): Promise<void> {
    let session = sessionManager.getSession(userId);

    if (isFromMe && session.state === State.ATENCION_HUMANA) {
      if (esFraseDeCierre(messageText)) {
        logger.info({ userId, message: messageText }, 'Frase de cierre detectada — reactivando bot');
        session = sessionManager.updateSession(userId, {
          state: State.WELCOME,
          context: {},
          log: [],
        });
        await sessionManager.save();
        await delay(2500);
        await sendHumanMessage(sock, userId, [
          { text: '✅ *Atención finalizada.* Si tienes otra consulta, escribenos.' },
        ]);
      }
      return;
    }

    if (isFromMe) {
      return;
    }

    if (session.state === State.ATENCION_HUMANA) {
      const hoursSinceLast = (Date.now() - new Date(session.updatedAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLast < 24) {
        return;
      }
      logger.info({ userId, hoursSinceLast }, 'ATENCION_HUMANA expired — resets a welcome');
      session = sessionManager.updateSession(userId, {
        state: State.WELCOME,
        context: {},
        log: [],
      });
    }

    const expired = isSessionExpired(session);

    if (expired) {
      logger.info({ userId, lastActivity: session.updatedAt }, 'Session expired — resetting to welcome');
      session = sessionManager.updateSession(userId, {
        state: State.WELCOME,
        context: {},
        log: [],
      });
    }

    const isNewOrRestart =
      session.state === State.WELCOME || session.state === State.FINISHED;

    if (isNewOrRestart) {
      logger.info({ userId }, 'New conversation started');
    }

    const transition = processState(session, messageText);

    const now = new Date();
    const logEntry: LogEntry = {
      state: session.state,
      input: messageText,
      timestamp: now.toLocaleString('es-PE'),
    };

    const botMessages: BotMessage[] = [
      ...transition.messages.map((text) => ({ text })),
      ...(transition.files || []).map((file) => ({ file })),
    ];

    await sendHumanMessage(sock, userId, botMessages);

    session = sessionManager.updateSession(userId, {
      state: transition.nextState,
      context: transition.context || {},
      log: [...session.log, logEntry],
    });

    await sessionManager.save();

    if (transition.context?.requestHuman) {
      await this.triggerHumanAlert(userId, session.log);
    }

    if (transition.nextState === State.FINISHED) {
      logger.info({ userId }, 'Conversation finished');
    }
  }

  private async triggerHumanAlert(userId: string, conversationLog: LogEntry[]): Promise<void> {
    const now = new Date();
    const alert = {
      userNumber: userId.replace('@s.whatsapp.net', ''),
      date: now.toLocaleDateString('es-PE'),
      time: now.toLocaleTimeString('es-PE'),
      status: 'Solicita atención humana',
      conversationLog,
    };

    logger.info(
      { ...alert },
      'Human assistance requested - alert dispatched to notifiers',
    );

    await this.notifierManager.sendAlert(alert);
  }
}
