import { State, UserSession } from '../../types';
import { config } from '../../config';
import { Handler } from './handler-types';

export const handleSelectExchange: Handler = (input: string, _session: UserSession) => {
  if (input === '1') {
    return {
      nextState: State.SHOW_MENU,
      messages: [
        '✨ *¡Excelente elección! El Perú tiene grandes universidades esperando por ti.* 🇵🇪\n\n' +
         'Hacer movilidad nacional es una oportunidad increíble para expandir tus horizontes académicos, conocer nuevas culturas dentro de nuestro país y construir una red de contactos invaluable. 🙌\n\n' +
         '📌 *Revisa las opciones vigentes aquí:* \n' +
         `🔗 ${config.urls.paginaNacional}\n` +
         `O en *nuestras redes sociales:*\n` +
         `🔗 ${config.urls.enlaceFacebook}\n\n` +
        '🚀 *¿Te entusiasma la idea y estás listo para postular?*\n' +
        'No te preocupes por el proceso, hemos preparado una guía paso a paso para que registres tu inscripción de la manera más sencilla:\n' +
        `🔗 ${config.urls.guiaInscripcion}\n\n` +
        '¡Estamos aquí para acompañarte en cada paso de esta gran aventura! 💪🌟',
        
        '👇 *¿Qué te gustaría hacer ahora?*\n\n' +
        '1️⃣ Hablar con un asesor de la oficina\n' +
        '2️⃣ Volver al menú principal',
      ],
      context: { exchangeType: 'national' },
    };
  }

  if (input === '2') {
    return {
      nextState: State.SHOW_MENU,
      messages: [
        '✨ *¡Es hora de romper fronteras y llevar tu talento al mundo!* 🌎✈️\n\n' +
         'La movilidad internacional transformará tu vida por completo. Te permitirá conocer nuevos métodos de aprendizaje, perfeccionar idiomas, sumergirte en culturas fascinantes y crecer tanto a nivel profesional como personal. 🌟\n\n' +
         '📌 *Descubre los convenios internacionales vigentes aquí:* \n' +
         `🔗 ${config.urls.paginaInternacional}\n` +
         `O en *nuestras redes sociales:*\n` +
         `🔗 ${config.urls.enlaceFacebook}\n\n` +
        '🚀 *¿Listo para dar el gran salto internacional?*\n' +
        'Queremos que tu postulación sea un éxito. Sigue los pasos detallados de nuestra guía de inscripción para iniciar tu registro:\n' +
        `🔗 ${config.urls.guiaInscripcion}\n\n` +
        '¡El mundo te espera y en la OCRI estamos listos para impulsarte! 🎓',
        
        '👇 *¿Qué te gustaría hacer ahora?*\n\n' +
        '1️⃣ Hablar con un asesor de la oficina\n' +
        '2️⃣ Volver al menú principal',
      ],
      context: { exchangeType: 'international' },
    };
  }

  if (input === '3') {
    return {
      nextState: State.SELECT_ROLE,
      messages: [
        '*¿Qué rol cumples actualmente en nuestra universidad?*\n\n' +
        '1️⃣ Estudiante\n' +
        '2️⃣ Docente\n' +
        '3️⃣ Personal Administrativo\n' +
        '4️⃣ Volver al menú principal',
      ],
    };
  }

  return {
    nextState: State.SELECT_EXCHANGE,
    messages: ['Por favor selecciona una opción válida.'],
  };
};
