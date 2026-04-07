import { subscribe, unsubscribe, getStore, findParticipantById, removeParticipant } from '~~/server/utils/store'

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
} as const

const KEEP_ALIVE_MS = 15_000

function sendSSE(res: NodeJS.WritableStream, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

export default defineEventHandler((event) => {
  setResponseHeaders(event, SSE_HEADERS)

  const { res, req } = event.node
  const participantId = getCookie(event, 'raffle-participant-id') ?? null
  const store = getStore()

  // Send current state on connect
  sendSSE(res, 'init', {
    participants: store.participants,
    winner: store.winner,
    isRaffleRunning: store.isRaffleRunning,
  })

  const handler = (name: string, data: unknown) => sendSSE(res, name, data)
  subscribe(handler)

  const keepAlive = setInterval(() => res.write(':ping\n\n'), KEEP_ALIVE_MS)

  req.on('close', () => {
    unsubscribe(handler)
    clearInterval(keepAlive)

    // Auto-remove participant when connection drops
    if (participantId && findParticipantById(participantId)) {
      removeParticipant(participantId)
    }
  })

  event._handled = true
})
