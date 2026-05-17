const helmet = require('helmet');
const xss = require('xss-clean');
const sanitizeHtml = require('sanitize-html');
const morgan = require('morgan');

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      // strip all tags and attributes
      obj[key] = sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} });
    } else if (typeof val === 'object') {
      sanitizeObject(val);
    }
  }
  return obj;
}

module.exports = function applySecurity(app) {
  // HTTP headers
  app.use(helmet());

  // HSTS (1 week) — can be increased for production
  app.use(helmet.hsts({ maxAge: 7 * 24 * 60 * 60 }));

  // Basic request logging
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // Basic XSS cleaning middleware
  app.use(xss());

  // Custom sanitizer for body/query/params to remove HTML tags
  app.use((req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
    next();
  });
};
