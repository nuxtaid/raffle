<template>
  <div class="relative min-h-screen overflow-hidden bg-[#020617] text-white">
    <!-- Animated aurora blobs -->
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        class="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-20"
        style="
          background: radial-gradient(circle, #00dc82 0%, transparent 70%);
          animation: aurora 15s ease-in-out infinite;
        "
      />
      <div
        class="absolute -right-1/4 top-1/4 h-[50vmax] w-[50vmax] rounded-full opacity-15"
        style="
          background: radial-gradient(circle, #36e4da 0%, transparent 70%);
          animation: aurora 20s ease-in-out infinite reverse;
        "
      />
      <div
        class="absolute -bottom-1/4 left-1/3 h-[45vmax] w-[45vmax] rounded-full opacity-10"
        style="
          background: radial-gradient(circle, #a78bfa 0%, transparent 70%);
          animation: aurora 18s ease-in-out infinite 3s;
        "
      />
      <!-- Grid overlay for depth -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="
          background-image:
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 60px 60px;
        "
      />
      <!-- Noise texture -->
      <div
        class="absolute inset-0 opacity-[0.015]"
        style="background: url('data:image/svg+xml,&lt;svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 256 256&quot;&gt;&lt;filter id=&quot;n&quot;&gt;&lt;feTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/&gt;&lt;/filter&gt;&lt;rect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23n)&quot;/&gt;&lt;/svg&gt;');"
      />
    </div>

    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
