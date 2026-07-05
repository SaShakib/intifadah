function notFoundHandler(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

function errorHandler(error, req, res, _next) {
  const statusCode = Number(error.statusCode || 500);
  const message = error.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(`[error] id=${req.requestId || 'n/a'} ${message}`);
  }

  res.status(statusCode).json({
    message,
    requestId: req.requestId,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
