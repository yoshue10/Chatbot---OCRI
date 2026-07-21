import { State } from '../../types';
import { Handler } from './handler-types';

export const handleWaitingHuman: Handler = (_input: string) => {
  return {
    nextState: State.FINISHED,
    messages: ['*Tu solicitud ya ha sido registrada. Un asesor se comunicará contigo pronto.*'],
  };
};
