import { getStore } from '~~/server/utils/store'

export default defineEventHandler(() => {
  const store = getStore()
  return {
    participants: store.participants,
    winner: store.winner,
    isRaffleRunning: store.isRaffleRunning,
  }
})
