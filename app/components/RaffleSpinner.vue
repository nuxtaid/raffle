<script setup lang="ts">
const props = defineProps<{
  names: string[]
  duration?: number
}>()

const emit = defineEmits<{
  done: []
}>()

const INITIAL_SPEED = 50
const SPEED_INCREMENT = 3
const MAX_SPEED = 500

const duration = computed(() => props.duration ?? 5000)
const currentIndex = ref(0)
const isSpinning = ref(true)
const speed = ref(INITIAL_SPEED)

let stepTimer: ReturnType<typeof setTimeout> | undefined
let endTimer: ReturnType<typeof setTimeout> | undefined

const displayName = computed(() => props.names[currentIndex.value] ?? '')
const glowIntensity = computed(() => Math.min(speed.value / MAX_SPEED, 1))

function clearTimers() {
  clearTimeout(stepTimer)
  clearTimeout(endTimer)
}

function startSpin() {
  isSpinning.value = true
  speed.value = INITIAL_SPEED

  const step = () => {
    currentIndex.value = (currentIndex.value + 1) % props.names.length
    speed.value = Math.min(speed.value + SPEED_INCREMENT, MAX_SPEED)
    stepTimer = setTimeout(step, speed.value)
  }

  stepTimer = setTimeout(step, speed.value)

  endTimer = setTimeout(() => {
    clearTimeout(stepTimer)
    isSpinning.value = false
    emit('done')
  }, duration.value)
}

onMounted(startSpin)
onUnmounted(clearTimers)
</script>

<template>
  <div class="relative flex flex-col items-center justify-center py-8">
    <!-- Spinning ring behind -->
    <div
      v-if="isSpinning"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div
        class="h-48 w-48 rounded-full border-2 border-transparent opacity-30"
        style="
          border-image: conic-gradient(#00dc82, #36e4da, #a78bfa, #00dc82) 1;
          animation: spin-slow 2s linear infinite;
        "
      />
    </div>

    <!-- Glow -->
    <div
      class="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
      :style="{ opacity: isSpinning ? 0.4 + glowIntensity * 0.4 : 0 }"
    >
      <div class="h-32 w-80 rounded-full bg-green-500/40 blur-3xl" />
    </div>

    <!-- Name display -->
    <div class="relative">
      <div
        class="text-5xl md:text-8xl font-black tracking-tight transition-all"
        :class="[
          isSpinning
            ? 'text-green-400 duration-75'
            : 'text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 duration-500',
        ]"
        :style="{
          filter: isSpinning ? `blur(${Math.max(0, 2 - glowIntensity * 2)}px)` : 'blur(0)',
          animation: !isSpinning ? 'text-glow 2s ease-in-out infinite' : 'none',
        }"
      >
        {{ displayName }}
      </div>
    </div>

    <!-- Speed indicator dots -->
    <div v-if="isSpinning" class="mt-8 flex gap-1.5">
      <div
        v-for="i in 5"
        :key="i"
        class="h-1.5 w-6 rounded-full transition-all duration-300"
        :class="speed < (i * 100) ? 'bg-green-400' : 'bg-white/10'"
      />
    </div>
  </div>
</template>
