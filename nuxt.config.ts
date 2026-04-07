import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({

  modules: [
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/image',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/scripts',
    '@nuxtjs/ngrok',
    '@nuxt/test-utils',
  ],

  devtools: {
    enabled: true,
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    adminSecret: '',
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [
      tailwindcss(),
    ],
    optimizeDeps: {
      include: [
        'uqr',
      ],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  ngrok: {
    authtoken_from_env: true,
  },
})
