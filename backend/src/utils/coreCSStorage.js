import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Base directory for local study material uploads
export const CORE_CS_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'core-cs');

// Ensure upload directory exists synchronously on startup
if (!fs.existsSync(CORE_CS_UPLOAD_DIR)) {
  fs.mkdirSync(CORE_CS_UPLOAD_DIR, { recursive: true });
}

// Allowed MIME types and extensions for PDF / PPT / PPTX
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.ppt', '.pptx'];

export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

/**
 * Configure Multer disk storage with sanitized unique filenames
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CORE_CS_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `corecs_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File filter to validate MIME types and file extensions
 */
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mimeType)) {
    const error = new Error('Invalid file format. Only PDF, PPT, and PPTX documents are allowed.');
    error.status = 400;
    return cb(error, false);
  }

  cb(null, true);
};

export const uploadCoreCSMaterial = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Safely delete a file from the upload directory
 */
export const removeLocalFile = (fileName) => {
  if (!fileName) return;
  try {
    const safeBaseName = path.basename(fileName);
    const filePath = path.join(CORE_CS_UPLOAD_DIR, safeBaseName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error removing local file:', err);
  }
};
