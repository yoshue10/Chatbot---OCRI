import { State, UserSession } from '../../types';
import { Handler } from './handler-types';
import { handleWelcome } from './welcome';

export const handleShowMenu: Handler = (input: string, session: UserSession) => {
  if (input === '1') {
    return {
      nextState: State.ATENCION_HUMANA,
      messages: ['Un asesor atenderá tu solicitud en unos momentos.'],
      context: { requestHuman: true, atencionInicio: new Date().toISOString() },
    };
  }

  if (input === '2') {
    return handleWelcome(input, session);
  }

  return {
    nextState: State.SHOW_MENU,
    messages: ['Por favor selecciona una opción válida.'],
  };
};
