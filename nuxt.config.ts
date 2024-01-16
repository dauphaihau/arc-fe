import pkg from './package.json';

export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: `%s - ${pkg.name}`,
      meta: [
        { charset: 'utf-8' },
        {
          hid: 'viewport',
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        { hid: 'description', name: 'description', content: pkg.description },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  srcDir: 'src/',
  ssr: false,
  devtools: { enabled: true },
  modules: [
    '@nuxt/devtools',
    '@pinia/nuxt',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    'nuxt-security',
    '@formkit/auto-animate/nuxt',
    '@nuxt/image',
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
    },
  },
  runtimeConfig: {
    public: {
      apiBaseURL: process.env.API_BASE_URL,
      apiVersion: process.env.API_VERSION,
      awsHostBucket: process.env.AWS_S3_HOST_BUCKET,
      accessTokenExpirationMins: process.env.ACCESS_TOKEN_EXPIRATION_MINS,
      refreshTokenExpirationDays: process.env.REFRESH_TOKEN_EXPIRATION_DAYS,
    },
  },
  pinia: {
    storesDirs: ['./src/stores/**'],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  i18n: {
    locales: [
      {
        code: 'en',
        file: 'en-US.js',
      },
      {
        code: 'fr',
        file: 'fr-FR.js',
      },
      {
        code: 'la',
        file: 'la-LA.js',
      },
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'en',
  },
  colorMode: {
    preference: 'light',
  },
  css: ['~/assets/css/main.css'],
  image: {
    domains: [process.env.AWS_S3_HOST_BUCKET as string],
  },
});
