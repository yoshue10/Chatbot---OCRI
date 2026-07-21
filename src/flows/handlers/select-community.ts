import { State } from '../../types';
import { config } from '../../config';
import { Handler } from './handler-types';

export const handleSelectCommunity: Handler = (input: string) => {
  if (input === '1') {
    return {
      nextState: State.SELECT_ROLE,
      messages: [
        '¡Excelente! 🎉 Cuéntanos, ¿Qué rol cumples actualmente en nuestra universidad?\n\n' +
        '1️⃣ Estudiante\n' +
        '2️⃣ Docente\n' +
        '3️⃣ Personal Administrativo\n' +
        '4️⃣ Volver al menú principal',
      ],
    };
  }

  if (input === '2') {
    return {
      nextState: State.SHOW_MENU,
      messages: [
        '🌐 *¡Qué bueno que nos escribas!*\n\n' +
        'Conoce nuestras oportunidades disponibles para estudiantes nacionales o internacionales.\n\n' +
        '🇵🇪 Nacionales\n\n' +
        '📄 Convocatoria Nacional (PDF)\n' +
        `🔗 ${config.urls.convocatoriaNacional}\n\n` +
        '🌎 Internacionales\n\n' +
        '📄 Convocatoria Internacional (PDF)\n' +
        `🔗 ${config.urls.convocatoriaInternacional}\n\n` +      
        '¿Listo para Inscribirte?\n\n' +
        '🎉 ¡Genial! Sigue los pasos de la siguiente guía para registrar tu inscripción en nuestra página.\n\n' +
        `🔗 ${config.urls.guiaInscripcion}`,
        '👇 *¿Qué te gustaría hacer ahora?*\n\n' +
        '1️⃣ Hablar con un asesor\n' +
        '2️⃣ Volver al menú principal',
      ],
      context: { origin: 'external' },
    };
  }

  return {
    nextState: State.SELECT_COMMUNITY,
    messages: [
      'Por favor selecciona una opción válida escribiendo únicamente el número correspondiente.',
    ],
  };
};
