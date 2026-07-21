import { UserSession, Transition } from '../../types';

export type Handler = (input: string, session: UserSession) => Transition;
