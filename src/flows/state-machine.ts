import { State, UserSession, Transition } from '../types';
import { Handler } from './handlers/handler-types';
import { handleWelcome } from './handlers/welcome';
import { handleSelectCommunity } from './handlers/select-community';
import { handleSelectRole } from './handlers/select-role';
import { handleSelectExchange } from './handlers/select-exchange';
import { handleShowMenu } from './handlers/show-menu';
import { handleWaitingHuman } from './handlers/waiting-human';
import { handleFinished } from './handlers/finished';
import { logger } from '../services/logger';

type StateHandlerMap = Record<State, Handler>;

const noopHandler: Handler = (_input: string, _session: UserSession) => ({
  nextState: State.ATENCION_HUMANA,
  messages: [],
});

const handlerMap: StateHandlerMap = {
  [State.WELCOME]: handleWelcome,
  [State.SELECT_COMMUNITY]: handleSelectCommunity,
  [State.SELECT_ROLE]: handleSelectRole,
  [State.SELECT_EXCHANGE]: handleSelectExchange,
  [State.SHOW_MENU]: handleShowMenu,
  [State.WAITING_HUMAN]: handleWaitingHuman,
  [State.ATENCION_HUMANA]: noopHandler,
  [State.FINISHED]: handleFinished,
};

export function processState(
  session: UserSession,
  input: string,
): Transition {
  const handler = handlerMap[session.state];

  if (!handler) {
    logger.error({ state: session.state }, 'No handler found for state');
    return {
      nextState: State.WELCOME,
      messages: ['Error interno. Por favor intenta de nuevo.'],
    };
  }

  const transition = handler(input, session);
  logger.debug(
    { userId: session.userId, fromState: session.state, toState: transition.nextState },
    'State transition',
  );

  return transition;
}
