import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import CoreCSTheory from '../models/CoreCSTheory.js';
import { CORE_CS_UPLOAD_DIR } from '../utils/coreCSStorage.js';
import { seedCoreCSTheory } from '../data/seedCoreCSTheory.js';

/**
 * Ensures seed Core CS theory records exist in DB on first query
 */
export const ensureCoreCSSeedTheory = async () => {
  const count = await CoreCSTheory.countDocuments();
  if (count === 0) {
    await CoreCSTheory.insertMany(seedCoreCSTheory, { ordered: false });
  }
};

/**
 * GET /api/core-cs/theory
 * List published theory and study materials with filtering and pagination.
 * Excludes large text content in the list response.
 */
export const getPublishedTheoryList = async (req, res) => {
  await ensureCoreCSSeedTheory();

  const { subject, topic, type, limit = 20, page = 1 } = req.query;

  const filter = { isPublished: true };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  if (type) filter.type = type;

  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const parsedPage = Math.max(Number(page) || 1, 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const total = await CoreCSTheory.countDocuments(filter);
  const materials = await CoreCSTheory.find(filter)
    .select('-content')
    .sort({ order: 1, title: 1 })
    .skip(skip)
    .limit(parsedLimit)
    .lean();

  const formattedMaterials = materials.map((item) => ({
    id: item._id,
    _id: item._id,
    title: item.title,
    subject: item.subject,
    topic: item.topic,
    type: item.type,
    summary: item.summary,
    originalFileName: item.originalFileName,
    fileMimeType: item.fileMimeType,
    fileSize: item.fileSize,
    fileUrl: item.fileUrl,
    order: item.order,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  res.status(200).json({
    success: true,
    total,
    page: parsedPage,
    totalPages: Math.ceil(total / parsedLimit) || 1,
    materials: formattedMaterials,
  });
};

/**
 * GET /api/core-cs/theory/:id
 * Retrieve single published theory/material detail.
 * Returns content for type="text" and file access info for type="pdf"/"ppt".
 */
export const getPublishedTheoryById = async (req, res) => {
  await ensureCoreCSSeedTheory();

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findOne({ _id: id, isPublished: true }).lean();

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Study material not found or is unpublished',
    });
  }

  res.status(200).json({
    success: true,
    material: {
      id: material._id,
      _id: material._id,
      title: material.title,
      subject: material.subject,
      topic: material.topic,
      type: material.type,
      content: material.type === 'text' ? material.content : undefined,
      fileUrl: material.type !== 'text' ? material.fileUrl : undefined,
      originalFileName: material.originalFileName,
      fileMimeType: material.fileMimeType,
      fileSize: material.fileSize,
      summary: material.summary,
      order: material.order,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt,
    },
  });
};

/**
 * GET /api/core-cs/theory/:id/file
 * Securely stream published PDF / PPT study material file to client.
 */
export const streamTheoryFile = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid theory ID format',
    });
  }

  const material = await CoreCSTheory.findById(id).lean();

  if (!material) {
    return res.status(404).json({
      success: false,
      error: 'Study material not found',
    });
  }

  // Must be published unless request is authorized by admin (if user attached)
  const isAuthorizedAdmin = req.adminUser && req.adminUser.role === 'admin';
  if (!material.isPublished && !isAuthorizedAdmin) {
    return res.status(404).json({
      success: false,
      error: 'Study material is not published',
    });
  }

  if (material.type === 'text' || !material.fileName) {
    return res.status(400).json({
      success: false,
      error: 'This material does not have an attached file',
    });
  }

  const safeFileName = path.basename(material.fileName);
  const filePath = path.resolve(CORE_CS_UPLOAD_DIR, safeFileName);

  // Security: Prevent path traversal
  if (!filePath.startsWith(CORE_CS_UPLOAD_DIR)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Invalid file path.',
    });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found on server storage',
    });
  }

  // Set response headers for secure delivery
  res.setHeader('Content-Type', material.fileMimeType || 'application/octet-stream');
  const safeOriginalName = encodeURIComponent(material.originalFileName || safeFileName);
  res.setHeader('Content-Disposition', `inline; filename="${safeOriginalName}"`);

  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error('Error streaming file:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Failed to read study material file' });
    }
  });

  stream.pipe(res);
};
