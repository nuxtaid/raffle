<script setup lang="ts">
const COLORS = ['#00dc82', '#36e4da', '#a78bfa', '#facc15', '#fb923c', '#f87171', '#38bdf8', '#4ade80']
const SHAPES = ['square', 'circle', 'strip'] as const
const NUM_PIECES = 60

type Shape = typeof SHAPES[number]

interface Piece {
  id: number
  color: string
  left: string
  delay: string
  duration: string
  size: number
  shape: Shape
}

const SHAPE_STYLES: Record<Shape, (size: number) => { width: string, height: string, borderRadius: string }> = {
  square:  (s) => ({ width: `${s}px`, height: `${s}px`, borderRadius: '2px' }),
  circle:  (s) => ({ width: `${s}px`, height: `${s}px`, borderRadius: '50%' }),
  strip:   (s) => ({ width: '4px',    height: `${s * 2.5}px`, borderRadius: '2px' }),
}

function randomPiece(id: number): Piece {
  return {
    id,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 2}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: 6 + Math.random() * 10,
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]!,
  }
}

function pieceStyle(p: Piece) {
  return {
    left: p.left,
    backgroundColor: p.color,
    opacity: 0.9,
    animation: `confetti-fall ${p.duration} ease-in ${p.delay} forwards`,
    ...SHAPE_STYLES[p.shape](p.size),
  }
}

const pieces = ref<Piece[]>([])

onMounted(() => {
  pieces.value = Array.from({ length: NUM_PIECES }, (_, i) => randomPiece(i))
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-50 overflow-hidden">
    <div
      v-for="p in pieces"
      :key="p.id"
      class="absolute -top-4"
      :style="pieceStyle(p)"
    />
  </div>
</template>
