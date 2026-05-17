const multer = require('multer');
const path = require('path');

// Phase 3 implementation: 
// Use memoryStorage because we need to perform duplicate detection BEFORE writing to disk.
const storage = multer.memoryStorage();

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only! (jpeg, jpg, png, webp)'));
    }
  }
});

module.exports = { uploadMiddleware };
