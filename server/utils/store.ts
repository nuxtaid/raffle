// TODO: repalce with pinia maybe
export interface RaffleStore {
  participants: Participant[]
  winner: Participant | null
  isRaffleRunning: boolean
}

type Subscriber = (event: string, data: unknown) => void

const store: RaffleStore = {
  participants: [],
  winner: null,
  isRaffleRunning: false,
}

const subscribers = new Set<Subscriber>()

export const getStore = (): RaffleStore => store

export const findParticipantById = (id: string) =>
  store.participants.find(p => p.id === id)

export function addParticipant(participant: Participant) {
  store.participants.push(participant)
  broadcast('participant-joined', participant)
}

export function removeParticipant(id: string) {
  const idx = store.participants.findIndex(p => p.id === id)
  if (idx === -1) return
  const [removed] = store.participants.splice(idx, 1)
  broadcast('participant-left', removed)
}

export function resetStore() {
  store.participants = []
  store.winner = null
  store.isRaffleRunning = false
  broadcast('reset', null)
}

export function setWinner(winner: Participant | null) {
  store.winner = winner
  broadcast('winner', winner)
}

export function setRaffleRunning(running: boolean) {
  store.isRaffleRunning = running
  broadcast('raffle-running', running)
}

export const subscribe = (fn: Subscriber) => subscribers.add(fn)
export const unsubscribe = (fn: Subscriber) => subscribers.delete(fn)

function broadcast(event: string, data: unknown) {
  for (const fn of subscribers) fn(event, data)
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

const ADJECTIVES = [
  'Async', 'Cached', 'Lazy', 'Broken', 'Buggy', 'Turbo', 'Pixel',
  'Binary', 'Infinite', 'Random', 'Deleted', 'Hidden', 'Frozen', 'Dark',
  'Silent', 'Lucky', 'Glitchy', 'Mega', 'Ultra', 'Super', 'Hyper',
  'Fast', 'Slow', 'Tiny', 'Giant', 'Secret', 'Spicy', 'Crispy',
  'Fuzzy', 'Sneaky', 'Bold', 'Epic', 'Chaotic', 'Chill', 'Wild',
] as const

const NOUNS = [
  'Bug', 'Loop', 'Crash', 'Pixel', 'Cursor', 'Error', 'Wifi',
  'Robot', 'Hacker', 'Noob', 'Server', 'Cookie', 'Cloud', 'Bot',
  'Admin', 'Linux', 'Windows', 'Mac', 'Kernel', 'Docker', 'Git',
  'Python', 'Java', 'React', 'Node', 'Nuxt', 'Vue', 'CSS',
  'HTML', 'Rust', 'Regex', 'API', 'Debug', 'Stack', 'Sudo',
  'Byte', 'Emoji', 'Tab', 'Space', 'Commit', 'Deploy', 'Reboot',
] as const

const MAX_NAME_NUM = 99

export function generateRandomName(): string {
  const adj = pickRandom(ADJECTIVES)
  const noun = pickRandom(NOUNS)
  const num = Math.floor(Math.random() * MAX_NAME_NUM)
  return `${adj} ${noun} ${num}`
}
