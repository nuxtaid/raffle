# Raffle

A real-time raffle app built with Nuxt. An admin shares a QR code / link, participants join from their phones, and a winner is drawn live with a spinning animation and confetti.

## How It Works

### Admin Flow (`/`)

1. Enter the admin secret to unlock the dashboard.
2. Share the join URL or QR code with the audience.
3. Watch participants appear in real time.
4. Hit **Draw** to spin through names and reveal a winner.
5. **Reset** to clear everything and start a new round.

### Participant Flow (`/join`)

1. Open the join link on any device.
2. Tap **Join** — a random codename is assigned automatically.
3. Wait for the draw. The page updates in real time via SSE.
4. The winner sees a celebration screen with confetti; everyone else sees who won.

Closing the browser tab automatically removes the participant.

## Tech Stack

- **Nuxt 4** with server routes and SSE
- **Tailwind CSS 4** via the Vite plugin
- **VueUse** for reactive utilities
- **uqr** for QR code generation
- In-memory store (no database) — data resets on server restart

## Setup

```bash
pnpm install
```

Create a `.env` file (or set the environment variable) with your admin secret:

```
NUXT_ADMIN_SECRET=your-secret-here
```

## Development

```bash
pnpm dev
```

The app starts at `http://localhost:3000`. To expose it over the internet for participants, [ngrok](https://ngrok.com) support is built in via `@nuxtjs/ngrok` — just set `NGROK_AUTHTOKEN` in your environment.

## Production

```bash
pnpm build
pnpm preview
```

See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for hosting options.
