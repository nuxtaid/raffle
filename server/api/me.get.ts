import { findParticipantById } from '~~/server/utils/store'

export default defineEventHandler((event) => {
  const id = getCookie(event, 'raffle-participant-id')
  if (!id) {
    return { participant: null }
  }

  const participant = findParticipantById(id)
  return { participant: participant ?? null }
})
