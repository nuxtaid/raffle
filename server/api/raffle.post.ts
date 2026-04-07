import { getStore, setWinner, setRaffleRunning } from '~~/server/utils/store'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-admin-secret')
  const { adminSecret } = useRuntimeConfig(event)
  if (secret !== adminSecret) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  const { participants } = getStore()
  if (participants.length === 0) {
    throw createError({ statusCode: 400, message: 'No participants to raffle' })
  }

  setRaffleRunning(true)
  await new Promise(resolve => setTimeout(resolve, 100))

  const winner = participants[Math.floor(Math.random() * participants.length)]!
  setWinner(winner)
  setRaffleRunning(false)

  return winner
})
