# WhatsApp Bot - Oficina de Cooperación y Relaciones Internacionales UNCP

Bot conversacional para WhatsApp de la Oficina de Cooperación y Relaciones Internacionales de la Universidad Nacional del Centro del Perú (UNCP). Gestiona consultas de estudiantes, docentes y externos sobre convocatorias de intercambio nacional e internacional.

## Stack Tecnológico

| Componente       | Tecnología                                    |
|------------------|-----------------------------------------------|
| Lenguaje         | TypeScript 5.7+                               |
| Runtime          | Node.js 22+                                   |
| WhatsApp API     | [Baileys](https://github.com/WhiskeySockets/Baileys) (`@whiskeysockets/baileys`) |
| Logger           | Pino + Pino Pretty                            |
| Persistencia     | Archivo JSON (sesiones de conversación)       |
| Autenticación    | Multi-File Auth State (Baileys)               |

### ¿Por qué Baileys y no whatsapp-web.js?

| Factor                | Baileys                          | whatsapp-web.js                  |
|-----------------------|----------------------------------|----------------------------------|
| Dependencias          | Ninguna (protocolo directo)      | Requiere Puppeteer + Chrome      |
| Consumo de recursos   | Bajo                             | Alto (navegador headless)        |
| Multi-dispositivo     | Soporte nativo                   | Limitado                         |
| Reconexión            | Automática y robusta             | Propensa a desconexiones         |
| Despliegue            | Cualquier VPS                    | Requiere GPU/recursos gráficos   |
| Escalabilidad         | Alta (conexiones ligeras)        | Media                            |

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│                    WhatsApp Bot UNCP                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  WhatsAppBot │  │  MsgQueue    │  │ MessageCtrl    │  │
│  │  (Baileys)   │──▶ (FIFO x     │──▶ (State Machine)│  │
│  │  Connection  │  │  Usuario)    │  │                │  │
│  └─────────────┘  └──────────────┘  └───────┬────────┘  │
│                                             │           │
│  ┌──────────────────────────────────────────▼────────┐  │
│  │              State Handlers                        │  │
│  │  ┌──────┐ ┌──────┐ ┌────┐ ┌─────┐ ┌─────┐ ┌────┐ │  │
│  │  │Welcome│ │Select│ │Role│ │Exchg│ │Menu │ │Wait│ │  │
│  │  │       │ │Commun│ │    │ │     │ │     │ │Hum │ │  │
│  │  └──────┘ └──────┘ └────┘ └─────┘ └─────┘ └────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                             │           │
│  ┌──────────────────────────────────────────▼────────┐  │
│  │              NotifierManager                       │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐  │  │
│  │  │ Console │ │ WhatsApp │ │Telegram│ │  Email   │  │  │
│  │  └─────────┘ └──────────┘ └──────┘ └──────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Session Manager + Logger + Human Sender + Config  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Estructura del Proyecto

```
src/
├── index.ts                  # Punto de entrada
├── config/
│   └── index.ts             # Configuración centralizada (URLs, delays, etc.)
├── types/
│   └── index.ts             # Interfaces, tipos, enums
├── bot/
│   └── WhatsAppBot.ts       # Conexión con WhatsApp (Baileys)
├── flows/
│   ├── state-machine.ts     # Registro y resolución de handlers por estado
│   └── handlers/
│       ├── handler-types.ts # Tipo Handler compartido
│       ├── welcome.ts       # Bienvenida inicial
│       ├── select-community.ts  # ¿UNCP o externo?
│       ├── select-role.ts   # Estudiante / Docente / Admin
│       ├── select-exchange.ts   # Nacional / Internacional
│       ├── show-menu.ts     # Menú post-información
│       ├── waiting-human.ts # Solicitud de asesor humano
│       └── finished.ts      # Estado terminal / reinicio
├── controllers/
│   └── message-controller.ts # Orquestador: handler → mensajes → notificaciones
├── services/
│   ├── logger.ts            # Logger estructurado (Pino)
│   ├── session-manager.ts   # Sesiones de usuario por estado
│   └── message-queue.ts     # Cola FIFO por usuario
├── utils/
│   └── human-sender.ts      # Simulación de escritura humana
└── notifiers/
    ├── INotifier.ts         # Interfaz de notificación
    ├── ConsoleNotifier.ts   # Notificador por consola (default)
    ├── NotifierManager.ts   # Administrador de notificadores
    └── index.ts             # Re-exports
```

## Estados de Conversación (State Machine)

```
WELCOME ────▶ SELECT_COMMUNITY ──┬─ "1" ──▶ SELECT_ROLE ──┬─ "1" ──▶ SELECT_EXCHANGE ──┬─ "1"/"2" ──▶ SHOW_MENU
                                  │                       ├─ "2"/"3" ────────────────▶ SHOW_MENU
                                  │                       └─ "4" ──▶ WELCOME           └─ "3" ──▶ SELECT_ROLE
                                  │
                                  └─ "2" ──▶ SHOW_MENU ──┬─ "1" ──▶ WAITING_HUMAN ──▶ FINISHED ──▶ WELCOME
                                                         └─ "2" ──▶ WELCOME
```

## Instalación

### Requisitos

- Node.js 22+
- npm 10+
- Git (para instalar dependencias)

### Pasos

```bash
# 1. Clonar el repositorio
git clone <repo-url> whatsapp-bot-uncp
cd whatsapp-bot-uncp

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env según sea necesario

# 4. Compilar
npm run build

# 5. Iniciar el bot
npm start
```

## Configuración

### Variables de Entorno (.env)

| Variable             | Descripción                          | Default       |
|----------------------|--------------------------------------|---------------|
| `BOT_PREFIX`         | Prefijo del bot en logs              | `UNCP-BOT`    |
| `TYPING_MIN_DELAY`   | Mínimo delay de escritura (ms)       | `2000`        |
| `TYPING_MAX_DELAY`   | Máximo delay de escritura (ms)       | `3000`        |
| `FILE_DELAY`         | Delay antes de enviar archivos (ms)  | `2000`        |
| `SESSION_FILE`       | Ruta del archivo de sesiones         | `./data/sessions.json` |
| `ADMIN_PHONE`        | Teléfono del administrador           | (vacío)       |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram (opcional)  | (vacío)       |
| `TELEGRAM_CHAT_ID`   | Chat ID de Telegram (opcional)       | (vacío)       |
| `SMTP_*`             | Configuración SMTP (opcional)         | (vacío)       |
| `LOG_LEVEL`          | Nivel de log: debug, info, warn, error | `info`      |

### URLs (src/config/index.ts)

Todas las URLs están centralizadas en `src/config/index.ts`:

```typescript
urls: {
  convocatoriaNacional: 'https://cooperacion.uncp.edu.pe/convocatorias-nacionales',
  convocatoriaInternacional: 'https://cooperacion.uncp.edu.pe/convocatorias-internacionales',
  guiaInscripcion: 'https://cooperacion.uncp.edu.pe/convocatorias-externos',
}
```

## Uso

### Inicio

```bash
# Desarrollo (con hot-reload)
npm run dev

# Producción
npm run build
npm start
```

Al iniciar por primera vez, se mostrará un código QR en la terminal. Escanéalo con WhatsApp (Menú > Dispositivos vinculados > Vincular un dispositivo).

### Comandos

- `npm run build` — Compila TypeScript a JavaScript
- `npm start` — Inicia el bot en producción
- `npm run dev` — Inicia el bot en modo desarrollo

## Cómo Agregar Nuevos Flujos

1. **Define el estado** en `src/types/index.ts` — agrega un nuevo valor al enum `State`

2. **Crea el handler** en `src/flows/handlers/` — crea un archivo que exporte una función que cumpla con el tipo `Handler`:

   ```typescript
   import { State, UserSession, Transition } from '../../types';
   import { Handler } from './handler-types';

   export const handleNewFlow: Handler = (input: string, session: UserSession): Transition => {
     // Validar input
     // Devolver { nextState, messages, context }
   };
   ```

3. **Registra el handler** en `src/flows/state-machine.ts` — agrega tu handler al `handlerMap`

4. **Conecta las transiciones** — modifica los handlers existentes para que puedan transicionar a tu nuevo estado

5. **Configura URLs o mensajes** en `src/config/index.ts` si tu nuevo flujo necesita URLs

## Despliegue

### Opción 1: VPS (Recomendado)

```bash
# Instalar Node.js 22+ y Git
git clone <repo-url>
cd whatsapp-bot-uncp
npm install --production
npm run build
npx pm2 start dist/index.js --name whatsapp-bot-uncp
```

### Opción 2: Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Persistencia de Sesiones

Las sesiones de WhatsApp se almacenan en `auth_info/` (creado automáticamente). Las sesiones de conversación se almacenan en el archivo configurado por `SESSION_FILE`.

**Importante**: Respaldar `auth_info/` y `data/sessions.json` para no perder la autenticación al redeployar.

## Sistema de Notificaciones (Alerta de Asesor Humano)

Cuando un usuario solicita hablar con un asesor, se genera una alerta que incluye:
- Número de teléfono del usuario
- Fecha y hora
- Estado: "Solicita atención humana"

La alerta se distribuye a través del `NotifierManager`, que permite agregar múltiples canales de notificación de forma desacoplada (Open/Closed Principle):

```typescript
const manager = new NotifierManager();
manager.addNotifier(new ConsoleNotifier());       // Log en consola
manager.addNotifier(new WhatsAppNotifier(sock));  // Mensaje a admin
manager.addNotifier(new TelegramNotifier(token)); // Mensaje a Telegram
manager.addNotifier(new EmailNotifier(config));   // Correo electrónico
manager.addNotifier(new DatabaseNotifier());      // Base de datos
```

Para crear un nuevo notificador, implementa la interfaz `INotifier`:

```typescript
import { INotifier } from './INotifier';
import { Alert } from '../types';

export class MyNotifier implements INotifier {
  async sendAlert(alert: Alert): Promise<void> {
    // Enviar alerta por tu canal
  }
}
```

## Principios Aplicados

- **SOLID**: Single Responsibility (cada handler hace una cosa), Open/Closed (nuevos notificadores sin modificar existentes), Dependency Inversion (INotifier interface)
- **Clean Code**: Nombres descriptivos, funciones pequeñas, sin comentarios innecesarios
- **DRY**: Validaciones y mensajes compartidos
- **KISS**: State Machine simple con handlers puros
- **Patrón State Machine**: Reemplaza if/else anidados con una máquina de estados explícita

## Licencia

MIT
