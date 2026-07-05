const crypto = require('node:crypto');

function requestInterceptor(req, res, next) {
  const start = process.hrtime.bigint();
  const requestId = crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    if (durationMs > 1500) {
      // lightweight slow request log for free-tier observability
      console.warn(`[slow-request] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms id=${requestId}`);
    }
  });

  next();
}

module.exports = {
  requestInterceptor,
};
