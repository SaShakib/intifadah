const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const { requestInterceptor } = require('./middleware/request-interceptor');
const { notFoundHandler, errorHandler } = require('./middleware/error-handler');
const { systemRouter } = require('./routes/system.routes');
const { authRouter } = require('./routes/auth.routes');
const { adminRouter } = require('./routes/admin.routes');
const { userRouter } = require('./routes/user.routes');

function buildCorsOptions() {
  if (env.corsOrigin === '*') {
    return { origin: '*' };
  }

  const allowList = env.corsOrigin
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    origin(origin, callback) {
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
  };
}

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(requestInterceptor);
  app.use(cors(buildCorsOptions()));
  app.use(express.json({ limit: '128kb' }));

  app.use('/', systemRouter);
  app.use('/auth', authRouter);
  app.use('/admin', adminRouter);
  app.use('/user', userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp,
};
