<script setup lang="ts">
const state = ref<'loading' | 'idle' | 'joining' | 'joined' | 'error'>('loading')
const participant = ref<Participant | null>(null)
const errorMsg = ref('')
const winner = ref<Participant | null>(null)
const showWinBanner = ref(false)

onMounted(async () => {
  try {
    const { participant: existing } = await $fetch<{ participant: Participant | null }>('/api/me')
    if (existing) {
      participant.value = existing
      state.value = 'joined'
      connectSSE(existing.id)
      return
    }
  }
  catch {
    // no-op
  }
  state.value = 'idle'
})

async function joinRaffle() {
  state.value = 'joining'
  try {
    const data = await $fetch<Participant>('/api/join', { method: 'POST' })
    participant.value = data
    state.value = 'joined'
    connectSSE(data.id)
  }
  catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to join'
    state.value = 'error'
  }
}

function connectSSE(myId: string) {
  const { data, event } = useEventSource('/api/events', ['init', 'winner', 'reset'], {
    autoReconnect: { retries: -1, delay: 1000 },
  })

  watch([data, event], () => {
    if (!data.value || !event.value) return
    const parsed = JSON.parse(data.value)

    if (event.value === 'winner') {
      winner.value = parsed
      showWinBanner.value = parsed?.id === myId
    }
    else if (event.value === 'reset') {
      winner.value = null
      showWinBanner.value = false
      participant.value = null
      state.value = 'idle'
      useCookie('raffle-participant-id').value = null
    }
  })
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-12">
    <ConfettiExplosion v-if="showWinBanner" />

    <!-- Loading -->
    <div v-if="state === 'loading'" class="flex flex-col items-center gap-4">
      <Icon name="ph:circle-notch-bold" class="animate-spin text-green-400" size="32" />
    </div>

    <!-- Entry Screen -->
    <div
      v-else-if="state === 'idle' || state === 'joining'"
      class="text-center space-y-10 max-w-sm w-full"
      style="animation: slide-up 0.6s ease-out both"
    >
      <div class="space-y-4">
        <div class="relative inline-block">
          <Icon name="logos:nuxt-icon" size="72" class="relative" />
          <div class="absolute inset-0 bg-green-500/30 blur-2xl" />
        </div>
        <h1 class="text-4xl font-black tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          Nuxt Raffle
        </h1>
        <p class="text-white/40 text-sm">Tap below to enter. You'll get a unique codename!</p>
      </div>

      <button
        class="group relative w-full py-5 rounded-2xl text-xl font-black transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer overflow-hidden"
        :disabled="state === 'joining'"
        @click="joinRaffle"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500" />
        <div class="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        <span v-if="state === 'joining'" class="relative flex items-center justify-center gap-2 text-black">
          <Icon name="ph:circle-notch-bold" class="animate-spin" size="24" />
          Joining...
        </span>
        <span v-else class="relative flex items-center justify-center gap-3 text-black">
          <Icon name="ph:ticket-bold" size="24" />
          Join Raffle
        </span>
      </button>
    </div>

    <!-- Error -->
    <div v-else-if="state === 'error'" class="text-center space-y-6" style="animation: slide-up 0.4s ease-out both">
      <div class="glass-strong rounded-2xl p-8 space-y-4">
        <Icon name="ph:warning-circle-bold" size="48" class="text-red-400" />
        <p class="text-red-400 font-medium">{{ errorMsg }}</p>
      </div>
      <button
        class="px-6 py-3 glass rounded-xl text-sm hover:bg-white/10 transition-all cursor-pointer"
        @click="state = 'idle'"
      >
        Try Again
      </button>
    </div>

    <!-- Joined - Waiting -->
    <div v-else-if="state === 'joined'" class="text-center space-y-8 max-w-md w-full">
      <!-- Your Name Card -->
      <div class="relative" style="animation: pop-in 0.5s ease-out both">
        <div class="absolute -inset-2 bg-green-500/10 rounded-3xl blur-2xl" style="animation: pulse-glow 3s ease-in-out infinite" />
        <div class="relative glass-strong rounded-3xl p-6 sm:p-8 space-y-3" style="animation: border-dance 3s ease-in-out infinite">
          <p class="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Your codename</p>
          <div
            class="text-xl sm:text-3xl font-black bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent leading-snug"
            style="animation: text-glow 3s ease-in-out infinite; word-break: keep-all; overflow-wrap: anywhere;"
          >
            {{ participant?.name }}
          </div>
          <div class="flex items-center justify-center gap-2 text-white/20 text-xs mt-2">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            You're in the draw
          </div>
        </div>
      </div>

      <!-- Winner state -->
      <div v-if="winner">
        <!-- YOU WON -->
        <div v-if="showWinBanner" style="animation: pop-in 0.6s ease-out both">
          <div class="relative">
            <div class="absolute -inset-4 bg-green-500/20 rounded-3xl blur-3xl" style="animation: pulse-glow 1.5s ease-in-out infinite" />
            <div class="relative glass-strong rounded-3xl p-10 space-y-5 border-green-500/30">
              <div style="animation: float 2s ease-in-out infinite">
                <Icon name="ph:trophy-bold" size="80" class="text-yellow-400 mx-auto drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
              </div>
              <h2
                class="text-5xl font-black bg-gradient-to-r from-green-300 via-emerald-200 to-teal-300 bg-clip-text text-transparent"
              >
                YOU WON!
              </h2>
              <p class="text-white/50 text-lg">🎩 Come grab your <span class="text-green-400 font-bold">Nuxt</span> toque!</p>
            </div>
          </div>
        </div>

        <!-- Someone else won -->
        <div v-else class="glass rounded-2xl p-6 space-y-3" style="animation: slide-up 0.4s ease-out both">
          <p class="text-white/40 text-xs uppercase tracking-widest">The winner is</p>
          <p class="text-2xl font-black text-green-400">{{ winner.name }}</p>
          <p class="text-white/30 text-sm">Better luck next time! 🍀</p>
        </div>
      </div>

      <!-- Waiting state -->
      <div v-else class="flex flex-col items-center gap-4 text-white/30" style="animation: slide-up 0.6s ease-out 0.3s both">
        <div style="animation: float 3s ease-in-out infinite">
          <Icon name="ph:hourglass-medium-duotone" size="36" class="text-white/20" />
        </div>
        <p class="text-sm">Waiting for the raffle draw...</p>
        <p class="text-xs text-white/15">Keep this page open!</p>
      </div>
    </div>
  </div>
</template>
