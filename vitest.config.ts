import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: './test/vitest.setup.ts',
  },
})
