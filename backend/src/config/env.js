const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getRequired(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function parseNumber(value, fallback) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseEmailList(value) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isVercel: Boolean(process.env.VERCEL),

  port: parseNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || '*',

  databaseUrl: getRequired('DATABASE_URL'),
  dbHost: process.env.DB_HOST,
  dbPort: parseNumber(process.env.DB_PORT, undefined),
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD || undefined,

  pgSslMode: process.env.PGSSLMODE || 'require',
  pgConnectionLimit: parseNumber(process.env.PG_CONNECTION_LIMIT, undefined),
  pgSslRejectUnauthorized: process.env.PGSSL_REJECT_UNAUTHORIZED === 'true',
  pgCaCertPath: process.env.PG_CA_CERT_PATH,
  pgCaCert: process.env.PG_CA_CERT,

  jwtAccessSecret: getRequired('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: getRequired('JWT_REFRESH_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || '15m',
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  refreshTokenDays: parseNumber(process.env.REFRESH_TOKEN_DAYS, 30),
  resendApiKey: process.env.RESEND_API_KEY,
  mailFrom: process.env.MAIL_FROM || 'Intifadah <noreply@mail.intifadah.org>',
  passwordResetOtpTtlMinutes: parseNumber(process.env.PASSWORD_RESET_OTP_TTL_MINUTES, 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  pusherAppId: process.env.PUSHER_APP_ID,
  pusherKey: process.env.PUSHER_KEY,
  pusherSecret: process.env.PUSHER_SECRET,
  pusherCluster: process.env.PUSHER_CLUSTER,
  pusherUseTls: process.env.PUSHER_USE_TLS !== 'false',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:admin@mail.intifadah.org',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
  schedulerEnabled: process.env.SCHEDULER_ENABLED !== 'false',
  quranCronTimezone: process.env.QURAN_CRON_TIMEZONE || 'Asia/Dhaka',
  quranPenaltyPerMissedDayMinor: parseNumber(process.env.QURAN_PENALTY_PER_MISSED_DAY_MINOR, 5),

  superAdminEmails: parseEmailList(process.env.SUPERADMIN_EMAILS),
  adminEmails: parseEmailList(process.env.ADMIN_EMAILS),
  dataProvider: (process.env.DATA_PROVIDER || 'postgres').toLowerCase(),
};

module.exports = { env };
