export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@hotelcheckin.ca',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  pms: {
    cloudbeds: {
      apiKey: process.env.CLOUDBEDS_API_KEY,
      clientId: process.env.CLOUDBEDS_CLIENT_ID,
      clientSecret: process.env.CLOUDBEDS_CLIENT_SECRET,
    },
    mews: {
      clientToken: process.env.MEWS_CLIENT_TOKEN,
      accessToken: process.env.MEWS_ACCESS_TOKEN,
      platformAddress: process.env.MEWS_PLATFORM_ADDRESS,
    },
    lightspeed: {
      apiKey: process.env.LIGHTSPEED_API_KEY,
      clientId: process.env.LIGHTSPEED_CLIENT_ID,
      clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET,
    },
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || 'ca-central-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});
