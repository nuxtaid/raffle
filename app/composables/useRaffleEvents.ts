const SSE_EVENTS = ['init', 'participant-joined', 'participant-left', 'winner', 'raffle-running', 'reset'] as const
const TOAST_DURATION = 2000

export function useRaffleEvents() {
  const participants = ref<Participant[]>([])
  const winner = ref<Participant | null>(null)
  const isRaffleRunning = ref(false)
  const latestJoin = ref<Participant | null>(null)
  const latestLeave = ref<Participant | null>(null)

  const { status, data, event, close } = useEventSource('/api/events', [...SSE_EVENTS], {
    autoReconnect: {
      retries: -1,
      delay: 1000,
      onFailed: () => console.error('[SSE] Failed to connect after retries'),
    },
  })

  const handlers: Record<string, (parsed: any) => void> = {
    'init'(d) {
      participants.value = d.participants
      winner.value = d.winner
      isRaffleRunning.value = d.isRaffleRunning
    },
    'participant-joined'(d) {
      if (participants.value.some(p => p.id === d.id)) return
      participants.value = [...participants.value, d]
      latestJoin.value = d
    },
    'participant-left'(d) {
      participants.value = participants.value.filter(p => p.id !== d.id)
      latestLeave.value = d
    },
    'winner'(d) { winner.value = d },
    'raffle-running'(d) { isRaffleRunning.value = d },
    'reset'() {
      participants.value = []
      winner.value = null
      isRaffleRunning.value = false
    },
  }

  watch([data, event], () => {
    if (!data.value || !event.value) return
    handlers[event.value]?.(JSON.parse(data.value))
  })

  const { start: clearJoinToast } = useTimeoutFn(() => { latestJoin.value = null }, TOAST_DURATION, { immediate: false })
  const { start: clearLeaveToast } = useTimeoutFn(() => { latestLeave.value = null }, TOAST_DURATION, { immediate: false })

  watch(latestJoin, v => v && clearJoinToast())
  watch(latestLeave, v => v && clearLeaveToast())

  return {
    participants,
    winner,
    isRaffleRunning,
    latestJoin,
    latestLeave,
    status,
    close
  }
}
