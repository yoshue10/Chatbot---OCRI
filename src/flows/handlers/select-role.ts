import { State, UserSession } from '../../types';
import { config } from '../../config';
import { Handler } from './handler-types';
import { handleWelcome } from './welcome';

export const handleSelectRole: Handler = (input: string, session: UserSession) => {
  if (input === '1') {
    return {
      nextState: State.SELECT_EXCHANGE,
      messages: [
        '🌎 *¡El mundo te espera!*\n\n' +
        'Cuéntanos qué tipo de intercambio estás buscando.\n\n' +
        '1️⃣ Nacional\n' +
        '2️⃣ Internacional\n' +
        '3️⃣ Volver al menú anterior',
      ],
    };
  }

  if (input === '2') {
    return {
      nextState: State.SHOW_MENU,
      messages: [
        '👨‍🏫👩‍🏫 *Estimado/a docente, es un honor saludarle y acompañarle en su desarrollo académico.* ✨\n\n' +
        'Reconocemos y valoramos profundamente su interés en expandir sus fronteras profesionales, así como su compromiso con la investigación y la internacionalización de nuestra universidad. 🌎📈\n\n' +
        '📌 *Le invitamos a revisar el detalle de todas nuestras convocatorias y convenios vigentes aquí:* \n' +
        `🔗 ${config.urls.paginaConvocatoria}\n` +
        'O en *nuestras redes sociles:*\n' +
        `🔗 ${config.urls.enlaceFacebook}\n` +
        '🚀 *¿Decidido/a a postular?*\n' +
        '¡Nos alegra mucho! Para facilitarle el proceso técnico, hemos diseñado una guía clara y detallada paso a paso que le orientará en el registro correcto de su inscripción institucional:\n' +
        `🔗 ${config.urls.guiaInscripcion}\n\n` +
        'Todo el equipo de la OCRI está a su entera disposición para asegurar que su postulación sea un éxito absoluto. ¡Muchos éxitos en esta nueva meta académica! 🎓💼',
        
        '👇 *¿Cómo desea proceder en este momento?*\n\n' +
        '1️⃣ Hablar con un asesor de la oficina\n' +
        '2️⃣ Volver al menú principal',
      ],
      context: { role: 'teacher' },
    };
  }

  if (input === '3') {
    return {
      nextState: State.SHOW_MENU,
      messages: [
        '👨‍💼👩‍💼 *Personal Administrativo*\n\n' +
        '¡Tu trabajo también impulsa el crecimiento y la proyección internacional de nuestra universidad! 🌟\n\n' +
        'Como parte de la comunidad administrativa, puedes participar en programas de movilidad institucional y pasantías para fortalecer tus competencias profesionales.\n\n' +
        '📌 *¿Cómo postular?*\n' +
        'Por favor, sigue atentamente los pasos detallados en la imagen adjunta para completar tu registro e inscripción correctamente.\n\n' +
        'O sigue los pasos de la siguiente guía: \n\n' +
        `🔗 ${config.urls.guiaInscripcion}` +
        '🤝 *¡Estamos para ayudarte!* Si tienes alguna duda sobre el proceso o los requisitos, quedamos a tu entera disposición.\n\n' +
        '¡Mucho éxito en tu postulación! ✨',

        '👇 *¿Qué te gustaría hacer ahora?*\n\n' +
        '1️⃣ Hablar con un asesor\n' +
        '2️⃣ Volver al menú principal',
      ],
      files: [{ url: config.urls.imagenAdministrativo, caption: 'Guía de Movilidad para Personal Administrativo' }],
      context: { role: 'admin' },
    };
  }

  if (input === '4') {
    return handleWelcome(input, session);
  }

  return {
    nextState: State.SELECT_ROLE,
    messages: ['Por favor selecciona una opción válida.'],
  };
};
