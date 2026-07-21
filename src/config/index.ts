import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  bot: {
    prefix: process.env.BOT_PREFIX || 'UNCP-BOT',
    typingMinDelay: parseInt(process.env.TYPING_MIN_DELAY || '2000', 10),
    typingMaxDelay: parseInt(process.env.TYPING_MAX_DELAY || '3000', 10),
    fileDelay: parseInt(process.env.FILE_DELAY || '2000', 10),
  },

  session: {
    filePath: process.env.SESSION_FILE || path.join(__dirname, '../../data/sessions.json'),
  },

  admin: {
    phone: process.env.ADMIN_PHONE || '',
  },

  notifiers: {
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
    },
    email: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      to: process.env.EMAIL_TO || '',
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },

  urls: {
    convocatoriaNacional: 'https://cooperacion.uncp.edu.pe/convocatorias-nacionales',
    convocatoriaInternacional: 'https://cooperacion.uncp.edu.pe/convocatorias-internacionales',
    guiaInscripcion: 'https://cooperacion.uncp.edu.pe/convocatorias-externos',
    paginaConvocatoria: 'https://cooperacion.uncp.edu.pe/convocatorias',
    paginaNacional: 'https://cooperacion.uncp.edu.pe/nacionales',
    paginaInternacional: 'https://cooperacion.uncp.edu.pe/internacionales',
    enlaceFacebook: 'https://www.facebook.com/OCRIUNCP',
    imagenAdministrativo: 'https://raw.githubusercontent.com/Cooperacion-UNCP/Chatbot-OCRI---Media-/main/MOVILIDAD%20ADMINISTRATIVO.png',
  },
};
