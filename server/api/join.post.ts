import { getStore, addParticipant, generateRandomName, findParticipantById } from '~~/server/utils/store'

const MAX_NAME_ATTEMPTS = 50

export default defineEventHandler((event) => {
  const store = getStore()

  // Return existing participant if cookie matches
  const existingId = getCookie(event, 'raffle-participant-id')
  if (existingId) {
    const existing = findParticipantById(existingId)
    if (existing) return existing
  }

  // Generate a unique random name
  const existingNames = new Set(store.participants.map(p => p.name))
  let name = generateRandomName()
  for (let i = 0; i < MAX_NAME_ATTEMPTS && existingNames.has(name); i++) {
    name = generateRandomName()
  }

  const participant = { id: crypto.randomUUID(), name, joinedAt: Date.now() }
  addParticipant(participant)

  setCookie(event, 'raffle-participant-id', participant.id, {
    maxAge: 60 * 60 * 24,
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
  })

  return participant
})
