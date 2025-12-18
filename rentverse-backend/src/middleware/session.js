const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');

// Create a pool for the session store
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sessionMiddleware = session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: false, // We'll handle this via Prisma migration
  }),
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
});

module.exports = sessionMiddleware;
