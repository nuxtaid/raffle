import { findParticipantById, removeParticipant } from '~~/server/utils/store'

export default defineEventHandler((event) => {
  const id = getCookie(event, 'raffle-participant-id')
  if (!id) {
    return { success: false }
  }

  const participant = findParticipantById(id)
  if (participant) {
    removeParticipant(id)
  }

  setCookie(event, 'raffle-participant-id', '', {
    maxAge: 0,
    path: '/',
  })

  return { success: true }
})
