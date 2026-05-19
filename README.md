# Sales Dashboard V2 — Next.js Edition

Dashboard en vivo de ventas para **AI Summit 2026** y **Colombia Tech Week 2026**, migrado de Vite + Express a **Next.js 15** con App Router.

---

## Requisitos

- **Node.js ≥ 18.18** (idealmente Node 20+)
- **npm** (incluido con Node)

---

## Instalación

```bash
npm install
cp .env.example .env.local        # luego edita .env.local y pega tu ATTIO_API_KEY
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Primera carga: el endpoint de Attio puede tardar 3-8 segundos en poblar el caché. Después es instantáneo durante 5 minutos.

---

## Variables de entorno

| Variable        | Requerido | Descripción                                                                                |
| --------------- | --------- | ------------------------------------------------------------------------------------------ |
| `ATTIO_API_KEY` | Sí        | Token personal de Attio. Generar en **Attio → Settings → API tokens** con permisos de lectura sobre Deals y Lists. |

Define la variable en `.env.local` (nunca commitees este archivo).

---

## Estructura del proyecto

```
sales-dashboard-nextjs/
├── app/
│   ├── layout.tsx           # Root layout (Inter + ThemeProvider + es-CO)
│   ├── page.tsx             # Renderiza <Dashboard />
│   ├── globals.css          # Variables CSS light/dark + sistema "elevate"
│   └── api/
│       ├── health/          # Health check
│       ├── quarters/        # Lista de trimestres disponibles
│       ├── cache/           # GET (info) + DELETE (limpiar)
│       │   └── clear/       # POST (legacy)
│       ├── executive/[quarter]/
│       ├── ae/[quarter]/
│       ├── sdr/[quarter]/
│       ├── pipeline-review/[quarter]/
│       └── ae-meetings/     # Stub (GCal no implementado)
├── components/
│   ├── dashboard.tsx        # UI principal (client component)
│   ├── providers.tsx        # QueryClient + ThemeProvider
│   ├── theme-provider.tsx   # next-themes wrapper
│   └── ui/                  # shadcn/ui (Radix)
├── lib/
│   ├── attio.ts             # Cliente Attio + caché en memoria (5 min TTL)
│   ├── business-logic.ts    # Constantes + helpers + 4 funciones compute
│   ├── data.ts              # Tipos compartidos + formatters
│   ├── query-client.ts      # Singleton TanStack Query
│   └── utils.ts             # cn() helper
├── hooks/
├── public/
├── package.json
├── tailwind.config.ts
├── next.config.mjs
└── tsconfig.json
```

---

## Endpoints API

Todos corren en Node.js runtime, sin caché estático.

| Método | Ruta                              | Descripción                                                       |
| ------ | --------------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/health`                     | Health check.                                                     |
| GET    | `/api/quarters`                   | Lista los trimestres detectados en deals + Meeting Titans.        |
| GET    | `/api/cache`                      | Info del caché (edad en seg, conteos).                            |
| DELETE | `/api/cache`                      | Invalida el caché (siguiente request hará fetch fresco a Attio).  |
| POST   | `/api/cache/clear`                | Equivalente legacy a `DELETE /api/cache`.                         |
| GET    | `/api/executive/[quarter]?week=`  | Métricas ejecutivas (revenue, AE, SDR, alertas, hot deals).       |
| GET    | `/api/ae/[quarter]?week=`         | Detalle por AE (funnel, propuestas, seguimientos olvidados).      |
| GET    | `/api/sdr/[quarter]?week=`        | Detalle SDR desde Meeting Titans (contactos, conversión).         |
| GET    | `/api/pipeline-review/[quarter]`  | Forecast ponderado, cohortes, kill-or-advance, scorecards por AE. |
| GET    | `/api/ae-meetings`                | **Stub** — devuelve `{ meetings: [], byAE: {} }` (ver abajo).     |

El parámetro `[quarter]` acepta valores como `Q1 2026`, `Q2 2026`, `Q3 2026`, `Q4 2025`, o `all`. Va URL-encoded (`Q2%202026`).

---

## Caché

- **TTL**: 5 minutos en memoria del proceso Node.
- **Singleton**: variables module-level en `lib/attio.ts`; no usa Map global ni Redis.
- **Concurrency**: si llegan múltiples requests durante un fetch en curso, todos esperan la misma promesa (`fetchInProgress`).
- **Limpiar manualmente**:

```bash
curl -X DELETE http://localhost:3000/api/cache
```

> En desarrollo (`npm run dev`), Next.js HMR puede reiniciar el módulo y reiniciar el caché.

---

## Integraciones futuras

### Google Calendar (Discovery Calls por AE)

Actualmente `/api/ae-meetings` devuelve un payload vacío. Para activarlo:

1. Configurar OAuth 2.0 en Google Cloud Console.
2. Agregar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` al `.env.local`.
3. Implementar el fetch en `app/api/ae-meetings/route.ts` usando `googleapis` o `fetch` directo a `https://www.googleapis.com/calendar/v3/calendars/.../events`.
4. Mantener el mapping `AE_EMAIL_MAP` (santiago@, laura@, mariajose@, nathalia@, nicolas@colombiatechweek.co).

Los puntos de integración con cálculos de AE (`computeAEData`, `aeScoreCards` en pipeline review) ya tienen branches para usar `calendarMeetings`; basta poblar ese objeto desde el endpoint.

---

## Build de producción

```bash
npm run build
npm run start
```

`npm run start` arranca un servidor Node.js (no edge). Asegúrate de exportar `ATTIO_API_KEY` en el entorno antes de iniciar.

---

## Troubleshooting

- **401 desde Attio**: revisa que `ATTIO_API_KEY` en `.env.local` esté vigente. Genera un token nuevo en Attio → Settings → API tokens.
- **Primera carga lenta (3-8 s)**: normal. El caché está vacío y el endpoint trae todos los deals + entradas de Meeting Titans paginados. Refrescos siguientes son inmediatos.
- **Errores de tipo en `next build`**: ejecuta `npm run type-check` para diagnosticar; los componentes `ui/` de shadcn pueden requerir `strict: false` en algunos casos límite.
- **El dashboard arranca en light mode**: el layout fuerza `<html className="dark">`. Si lo cambias, recuerda invertir las variables CSS en `app/globals.css`.

---

## Stack

- **Next.js 15** App Router + Route Handlers
- **React 18** + **TanStack Query 5**
- **TypeScript 5** strict
- **Tailwind CSS 3** + **shadcn/ui** (Radix primitives)
- **Recharts** para visualizaciones
- **lucide-react** para iconos
- **next-themes** para dark mode (default)
- **Attio API v2** como única fuente de datos
