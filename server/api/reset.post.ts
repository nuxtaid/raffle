import { resetStore } from '~~/server/utils/store'

export default defineEventHandler((event) => {
  const secret = getHeader(event, 'x-admin-secret')
  const { adminSecret } = useRuntimeConfig(event)
  if (secret !== adminSecret) {
    throw createError({ statusCode: 403, message: 'Unauthorized' })
  }

  resetStore()
  return { success: true }
})
