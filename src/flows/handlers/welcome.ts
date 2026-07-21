import { State, UserSession } from '../../types';
import { Handler } from './handler-types';

export const handleWelcome: Handler = (_input: string, _session: UserSession) => {
  return {
    nextState: State.SELECT_COMMUNITY,
    messages: [
      '✨¡Bienvenido a la *Oficina de Cooperación y Relaciones Internacionales de la UNCP*!🏛️\n' +
      'Nos alegra mucho saludarte. Para ayudarte mejor, por favor dinos:\n\n' +
      '*¿Eres miembro de la comunidad UNCP?*\n\n' +
      '1️⃣ Sí, soy de la UNCP\n' +
      '2️⃣ No, soy externo\n\n' +
      '*Por favor responde únicamente con el número de la opción.*',
    ],
  };
};
