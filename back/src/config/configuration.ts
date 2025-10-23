export default () => ({
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod',
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  },
});
