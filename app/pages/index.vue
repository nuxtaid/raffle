<script setup lang="ts">
const { participants, winner, latestJoin } = useRaffleEvents()

const showSpinner = ref(false)
const raffleCompleted = ref(false)
const showConfetti = ref(false)
const isAuthenticated = ref(false)
const adminInput = ref('')
const authError = ref(false)

const requestUrl = useRequestURL()
const joinUrl = computed(() => `${requestUrl.origin}/join`)
const participantNames = computed(() => participants.value.map(p => p.name))

onMounted(() => {
  if (sessionStorage.getItem('raffle-admin-secret'))
    isAuthenticated.value = true
})

function getAdminHeaders() {
  return { 'x-admin-secret': sessionStorage.getItem('raffle-admin-secret') || '' }
}

function authenticate() {
  sessionStorage.setItem('raffle-admin-secret', adminInput.value)
  isAuthenticated.value = true
  authError.value = false
}

function handleAuthError() {
  authError.value = true
  isAuthenticated.value = false
  sessionStorage.removeItem('raffle-admin-secret')
}

watch([participants, winner], () => {
  if (participants.value.length === 0 && !winner.value) {
    showSpinner.value = false
    raffleCompleted.value = false
    showConfetti.value = false
  }
})

async function startRaffle() {
  if (participants.value.length === 0) return
  showSpinner.value = true
  raffleCompleted.value = false
  showConfetti.value = false

  try {
    await $fetch('/api/raffle', { method: 'POST', headers: getAdminHeaders() })
  }
  catch {
    handleAuthError()
    showSpinner.value = false
  }
}

function onSpinnerDone() {
  raffleCompleted.value = true
  showConfetti.value = true
}

async function resetRaffle() {
  try {
    await $fetch('/api/reset', { method: 'POST', headers: getAdminHeaders() })
  }
  catch {
    handleAuthError()
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Admin Login Gate -->
    <div
      v-if="!isAuthenticated"
      class="min-h-screen flex items-center justify-center px-6"
    >
      <div
        class="glass-strong rounded-3xl p-10 max-w-sm w-full text-center space-y-6"
        style="animation: slide-up 0.5s ease-out both"
      >
        <div class="relative inline-block">
          <Icon
            name="ph:lock-key-bold"
            size="48"
            class="text-green-400"
          />
          <div class="absolute inset-0 bg-green-500/20 blur-xl" />
        </div>
        <h2 class="text-2xl font-black">
          Admin Access
        </h2>
        <p class="text-white/40 text-sm">
          Enter the admin secret to manage the raffle
        </p>
        <form
          class="space-y-4"
          @submit.prevent="authenticate"
        >
          <input
            v-model="adminInput"
            type="password"
            placeholder="Secret"
            autocomplete="off"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-lg font-mono focus:outline-none focus:border-green-500/50 transition-colors"
          >
          <p
            v-if="authError"
            class="text-red-400 text-xs"
          >
            Wrong secret. Try again.
          </p>
          <button
            type="submit"
            class="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all cursor-pointer"
          >
            Enter
          </button>
        </form>
      </div>
    </div>

    <!-- Admin Dashboard -->
    <template v-else>
      <ConfettiExplosion v-if="showConfetti" />

      <!-- Header -->
      <header
        class="glass border-b border-white/5"
        style="animation: slide-down 0.5s ease-out both"
      >
        <div class="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <Icon
                name="logos:nuxt-icon"
                size="40"
              />
              <div class="absolute inset-0 bg-green-500/30 blur-xl rounded-full" />
            </div>
            <div>
              <h1 class="text-2xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Nuxt Raffle
              </h1>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <!-- Live counter -->
            <div class="flex items-center gap-2 glass rounded-full px-4 py-2">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span class="text-sm font-medium tabular-nums">
                {{ participants.length }}
              </span>
              <span class="text-xs text-white/40">joined</span>
            </div>
            <button
              v-if="!showSpinner"
              class="px-4 py-2 glass rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              @click="resetRaffle"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <!-- Join toast notification -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="latestJoin"
          class="fixed top-20 left-1/2 -translate-x-1/2 z-40 glass-strong rounded-full px-5 py-2.5 flex items-center gap-2"
        >
          <Icon
            name="ph:user-plus-bold"
            size="16"
            class="text-green-400"
          />
          <span class="text-sm font-semibold text-green-400">{{ latestJoin.name }}</span>
          <span class="text-xs text-white/40">joined!</span>
        </div>
      </Transition>

      <!-- Main Content -->
      <main class="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <!-- Pre-raffle: QR Code + Participants -->
        <div
          v-if="!showSpinner"
          class="grid lg:grid-cols-[1fr_1.5fr] gap-10 h-full"
        >
          <!-- QR Code Section -->
          <div
            class="flex flex-col items-center justify-center gap-8"
            style="animation: slide-up 0.6s ease-out both"
          >
            <div class="glass-strong rounded-3xl p-8 text-center relative overflow-hidden group">
              <!-- Card glow -->
              <div class="absolute -inset-1 bg-gradient-to-r from-green-500/10 via-teal-500/10 to-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div class="relative">
                <h2 class="text-2xl font-bold mb-1 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Scan to Join!
                </h2>
                <p class="text-white/40 text-sm mb-6">
                  Get a random codename & enter the draw
                </p>

                <!-- QR with glow effect -->
                <div
                  v-if="joinUrl"
                  class="relative inline-block"
                >
                  <div
                    class="absolute -inset-4 bg-green-500/10 rounded-2xl blur-2xl"
                    style="animation: pulse-glow 3s ease-in-out infinite"
                  />
                  <div class="relative bg-white rounded-2xl p-4 shadow-2xl shadow-green-500/10">
                    <QrCode
                      :url="joinUrl"
                      :size="240"
                    />
                  </div>
                </div>

                <p class="text-white/25 text-xs font-mono mt-5 break-all tracking-wide">
                  {{ joinUrl }}
                </p>
              </div>
            </div>

            <!-- Draw button -->
            <button
              class="group relative px-10 py-5 rounded-2xl text-lg font-black transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed overflow-hidden"
              :disabled="participants.length === 0"
              @click="startRaffle"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 transition-all duration-300" />
              <div class="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div class="absolute inset-[1px] bg-gradient-to-r from-green-500 via-emerald-400 to-teal-500 rounded-[15px]" />
              <span class="relative flex items-center gap-3 text-black">
                <Icon
                  name="ph:trophy-bold"
                  size="26"
                />
                Draw Winner!
              </span>
            </button>
          </div>

          <!-- Participants Grid -->
          <div style="animation: slide-up 0.8s ease-out both">
            <div class="flex items-center gap-3 mb-5">
              <h2 class="text-lg font-bold text-white/60">
                Participants
              </h2>
              <div class="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <div
              v-if="participants.length === 0"
              class="flex flex-col items-center justify-center py-24 text-white/20"
            >
              <div class="relative">
                <Icon
                  name="ph:users-three-duotone"
                  size="80"
                  class="relative"
                  style="animation: float 3s ease-in-out infinite"
                />
                <div class="absolute inset-0 bg-green-500/10 blur-3xl" />
              </div>
              <p class="text-lg mt-6 font-medium">
                Waiting for people to join...
              </p>
              <p class="text-sm mt-1 text-white/15">
                Scan the QR code to enter!
              </p>
            </div>

            <div
              v-else
              class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1"
            >
              <div
                v-for="(p, i) in participants"
                :key="p.id"
                class="glass rounded-xl px-4 py-3 text-center transition-all duration-300 hover:bg-white/[0.06] hover:border-green-500/20 group"
                :style="{ animation: `pop-in 0.4s ease-out ${Math.min(i * 0.05, 1)}s both` }"
              >
                <div class="font-bold text-green-400 text-sm group-hover:text-green-300 transition-colors">
                  {{ p.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Raffle Spinner -->
        <div
          v-else
          class="flex flex-col items-center justify-center min-h-[70vh] gap-8"
        >
          <div
            v-if="!raffleCompleted"
            class="text-center space-y-6"
            style="animation: slide-up 0.5s ease-out both"
          >
            <p class="text-sm font-bold text-white/30 uppercase tracking-[0.3em]">
              And the winner is...
            </p>
            <RaffleSpinner
              :names="participantNames"
              :duration="5000"
              @done="onSpinnerDone"
            />
          </div>

          <!-- Winner Reveal -->
          <div
            v-else
            class="text-center"
            style="animation: pop-in 0.6s ease-out both"
          >
            <div class="relative py-12">
              <!-- Multi-layer glow -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div
                  class="h-64 w-64 rounded-full bg-green-500/20 blur-[100px]"
                  style="animation: pulse-glow 2s ease-in-out infinite"
                />
              </div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div
                  class="h-48 w-48 rounded-full bg-teal-400/15 blur-[80px]"
                  style="animation: pulse-glow 2s ease-in-out infinite 0.5s"
                />
              </div>

              <div class="relative space-y-6">
                <div style="animation: float 2s ease-in-out infinite">
                  <Icon
                    name="ph:crown-bold"
                    size="72"
                    class="text-yellow-400 mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
                  />
                </div>
                <p class="text-sm font-bold text-white/30 uppercase tracking-[0.3em]">
                  Winner
                </p>
                <div
                  class="text-6xl md:text-9xl font-black bg-gradient-to-r from-green-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent pb-2"
                  style="animation: text-glow 2s ease-in-out infinite"
                >
                  {{ winner?.name }}
                </div>
                <p class="text-xl text-white/40 font-medium">
                  🎩 Wins the official <span class="text-green-400 font-bold">Nuxt</span> toque!
                </p>
              </div>
            </div>

            <button
              class="mt-12 px-6 py-3 glass rounded-xl text-sm text-white/50 hover:text-white/80 hover:bg-white/10 transition-all cursor-pointer"
              @click="resetRaffle"
            >
              Start Over
            </button>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="border-t border-white/5 px-6 py-3 text-center text-white/20 text-xs">
        Powered by <span class="text-green-500/60 font-semibold">Nuxt</span> · Running on <span class="text-white/30 font-semibold">Raspberry Pi</span>
      </footer>
    </template>
  </div>
</template>
