<script setup lang="ts">
import { encode } from 'uqr'

const props = defineProps<{
  url: string
  size?: number
}>()

const size = computed(() => props.size ?? 256)

const qrData = computed(() => {
  return encode(props.url, {
    ecc: 'M',
    border: 1,
  })
})

const svgPath = computed(() => {
  const { data, size: qrSize } = qrData.value
  let path = ''
  for (let y = 0; y < qrSize; y++) {
    for (let x = 0; x < qrSize; x++) {
      if (data[y]?.[x]) {
        path += `M${x},${y}h1v1h-1z`
      }
    }
  }
  return path
})

const viewBox = computed(() => {
  const s = qrData.value.size
  return `0 0 ${s} ${s}`
})
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect :width="qrData.size" :height="qrData.size" fill="white" rx="0.5" />
    <path :d="svgPath" fill="#18181b" />
  </svg>
</template>
