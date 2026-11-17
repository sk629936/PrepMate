import mongoose from 'mongoose';
import CoreCSTheory, { THEORY_TYPES } from '../models/CoreCSTheory.js';
import { CORE_CS_SUBJECTS } from '../data/coreCSCatalog.js';
import { removeLocalFile } from '../utils/coreCSStorage.js';

/**
 * Validates request payload for Core CS Theory & Study Materials
 */
export const validateTheoryPayload = (data, file, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push('Title is required and must be at least 3 characters long.');
    }
  }

  if (!isUpdate || data.subject !== undefined) {
    if (!data.subject || !CORE_CS_SUBJECTS.includes(data.subject)) {
      errors.push(`Subject must be one of: ${CORE_CS_SUBJECTS.join(', ')}.`);
    }
  }

  if (!isUpdate || data.topic !== undefined) {
    if (!data.topic || typeof data.topic !== 'string' || data.topic.trim().length === 0) {
      errors.push('Topic is required.');
    }
  }

  if (!isUpdate || data.type !== undefined) {
    if (!data.type || !THEORY_TYPES.includes(data.type)) {
      errors.push(`Type must be one of: ${THEORY_TYPES.join(', ')}.`);
    }
  }

  const type = data.type;
  if (type === 'text') {
    if (!isUpdate || data.content !== undefined) {
      if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
        errors.push('Content is required for text theory.');
      }
    }
  } else if (type === 'pdf' || type === 'ppt') {
    if (!isUpdate && !file && !data.fileUrl) {
      errors.push(`A valid ${type.toUpperCase()} file must be uploaded.`);
    }
  }

  return errors;
};

/**
 * GET /api/admin/core-cs/theory
 * List all study materials with admin filters, search, and pagination.
 */
export const getAdminTheoryList = async (req, res) => {
  const { subject, topic, type, isPublished, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (type) filter.type = type;
  if (isPublished !== undefined && isPublished !== '') {
    filter.isPublished = isPublished === 'true';
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
    ];
  }

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await CoreCSTheory.countDocuments(filter);
  const materials = await CoreCSTheory.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  res.status(200).json({
    success: true,
    total,
    page: parsedPage,
    totalPages: Math.ceil(total / parsedLimit) || 1,
    materials,
  });
};

/**
 * POST /api/admin/core-cs/theory
 * Create a new text theory or upload a PDF/PPT study material.
 * Defaults to isPublished = false.
 */
export const createTheory = async (req, res) => {
  const errors = validateTheoryPayload(req.body, req.file, false);
  if (errors.length > 0) {
    // If a file was uploaded on failed validation, clean it up
    if (req.file) {
      removeLocalFile(req.file.filename);
    }
    return res.status(400).json({
      success: false,
      error: errors.join(' '),
      errors,
    });
  }

  const {
    title,
    subject,
    topic,
    type,
    content = '',
    summary = '',
    order = 0,
    isPublished = false,
  } = req.body;

  let fileUrl = '';
  let originalFileName = '';
  let fileName = '';
  let fileMimeType = '';
  let fileSize = 0;

  if (req.file) {
    originalFileName = req.file.originalname;
    fileName = req.file.filename;
    fileMimeType = req.file.mimetype;
    fileSize = req.file.size;
  } else if (req.body.fileUrl) {
    fileUrl = req.body.fileUrl;
    originalFileName = req.body.originalFileName || '';
  }

  const newTheory = new CoreCSTheory({
    title: title.trim(),
    subject,
    topic: topic.trim(),
    type,
    content: type === 'text' ? content.trim() : '',
    fileUrl,
    originalFileName,
    fileName,
    fileMimeType,
    fileSize,
    summary: summary ? summary.trim() : '',
    order: Number(order) || 0,
    isPublished: Boolean(isPublished),
  });

  // Assign controlled fileUrl pointing to secure file stream endpoint
  if (fileName) {
    newTheory.fileUrl = `/api/core-cs/theory/${newTheory._id}/file`;
  }

  await newTheory.save();

  res.status(201).json({
    success: true,
    message: 'Study material created successfully',
    material: newTheory,
  });
};

/**
 * PUT /api/admin/core-cs/theory/:id
 * Update an existing theory item or replace its uploaded file.
 */
export const updateTheory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    if (req.file) removeLocalFile(req.file.filename);
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findById(id);
  if (!material) {
    if (req.file) removeLocalFile(req.file.filename);
    return res.status(404).json({
      success: false,
      error: 'Study material not found',
    });
  }

  const errors = validateTheoryPayload(req.body, req.file, true);
  if (errors.length > 0) {
    if (req.file) removeLocalFile(req.file.filename);
    return res.status(400).json({
      success: false,
      error: errors.join(' '),
      errors,
    });
  }

  const {
    title,
    subject,
    topic,
    type,
    content,
    summary,
    order,
    isPublished,
  } = req.body;

  if (title !== undefined) material.title = title.trim();
  if (subject !== undefined) material.subject = subject;
  if (topic !== undefined) material.topic = topic.trim();
  if (type !== undefined) material.type = type;
  if (content !== undefined) material.content = content.trim();
  if (summary !== undefined) material.summary = summary.trim();
  if (order !== undefined) material.order = Number(order) || 0;
  if (isPublished !== undefined) material.isPublished = Boolean(isPublished);

  // If a new file is uploaded, remove the old file from disk
  if (req.file) {
    if (material.fileName) {
      removeLocalFile(material.fileName);
    }
    material.originalFileName = req.file.originalname;
    material.fileName = req.file.filename;
    material.fileMimeType = req.file.mimetype;
    material.fileSize = req.file.size;
    material.fileUrl = `/api/core-cs/theory/${material._id}/file`;
  }

  await material.save();

  res.status(200).json({
    success: true,
    message: 'Study material updated successfully',
    material,
  });
};

/**
 * DELETE /api/admin/core-cs/theory/:id
 * Delete a study material record and its local file if present.
 */
export const deleteTheory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findById(id);
  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Study material not found',
    });
  }

  // Remove local uploaded file if present
  if (material.fileName) {
    removeLocalFile(material.fileName);
  }

  await CoreCSTheory.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Study material deleted successfully',
  });
};

/**
 * PATCH /api/admin/core-cs/theory/:id/publish
 * Publish a study material
 */
export const publishTheory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findById(id);
  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Study material not found',
    });
  }

  material.isPublished = true;
  await material.save();

  res.status(200).json({
    success: true,
    message: 'Study material published successfully',
    material,
  });
};

/**
 * PATCH /api/admin/core-cs/theory/:id/unpublish
 * Unpublish a study material
 */
export const unpublishTheory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findById(id);
  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Study material not found',
    });
  }

  material.isPublished = false;
  await material.save();

  res.status(200).json({
    success: true,
    message: 'Study material unpublished successfully',
    material,
  });
};
