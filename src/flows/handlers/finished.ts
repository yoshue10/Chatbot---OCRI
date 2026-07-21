import { UserSession } from '../../types';
import { Handler } from './handler-types';
import { handleWelcome } from './welcome';

export const handleFinished: Handler = (input: string, session: UserSession) => {
  return handleWelcome(input, session);
};
