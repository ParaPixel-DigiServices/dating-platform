export default () => ({
  server: {
    env: process.env.NODE_ENV,
    port: Number(process.env.PORT),
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  auth: {
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      refreshSecret: process.env.JWT_REFRESH_SECRET,
    },
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
  },

  security: {
    corsOrigin: process.env.CORS_ORIGIN,

    rateLimit: {
      ttl: Number(process.env.THROTTLE_TTL),
      limit: Number(process.env.THROTTLE_LIMIT),
    },
  },
});