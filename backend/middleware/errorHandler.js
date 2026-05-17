class ApiError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function applyErrorHandlers(app) {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found', errorCode: 'NOT_FOUND' });
  });

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    const errorCode = err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'ERROR');
    // Log server errors
    if (status >= 500) {
      console.error(err.stack || err);
    } else {
      console.warn(err.message || err);
    }
    res.status(status).json({ success: false, message, errorCode });
  });
}

module.exports = { ApiError, applyErrorHandlers };
