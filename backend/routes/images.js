const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { body, validationResult, query } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireStudent, requireAdmin } = require('./auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `image-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload validation
const uploadValidation = [
  body('caption').notEmpty().withMessage('Caption is required').isLength({ max: 500 }).withMessage('Caption must be less than 500 characters'),
  body('uploader_name').notEmpty().withMessage('Uploader name is required').isLength({ max: 100 }).withMessage('Name must be less than 100 characters'),
  body('roll_number').notEmpty().withMessage('Roll number is required').isLength({ max: 20 }).withMessage('Roll number must be less than 20 characters')
];

// Upload image (students only) - now with assignment support
router.post('/upload', authenticateToken, requireStudent, upload.single('image'), uploadValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { caption, uploader_name, roll_number, assignment_id } = req.body;

    // Verify that the student is uploading with their own roll number
    if (req.user.roll_number !== roll_number) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload images with your own roll number'
      });
    }

    // If assignment_id is provided, validate it
    if (assignment_id) {
      const [assignments] = await pool.execute(
        'SELECT id, max_images, due_date FROM assignments WHERE id = ? AND is_active = TRUE',
        [assignment_id]
      );

      if (assignments.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid assignment'
        });
      }

      const assignment = assignments[0];

      // Check if due date has passed
      if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Assignment due date has passed'
        });
      }

      // Check if student has already reached max images for this assignment
      const [existingImages] = await pool.execute(
        'SELECT COUNT(*) as count FROM images WHERE assignment_id = ? AND roll_number = ?',
        [assignment_id, roll_number]
      );

      if (existingImages[0].count >= assignment.max_images) {
        return res.status(400).json({
          success: false,
          message: `You can only upload ${assignment.max_images} image(s) for this assignment`
        });
      }
    }

    // Save to database
    const [result] = await pool.execute(
      `INSERT INTO images (filename, original_name, caption, uploader_name, roll_number, status, assignment_id) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [req.file.filename, req.file.originalname, caption, uploader_name, roll_number, assignment_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully and is pending approval',
      image: {
        id: result.insertId,
        filename: req.file.filename,
        caption,
        uploader_name,
        roll_number,
        status: 'pending',
        assignment_id: assignment_id || null,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database insert failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
});

// Get images with optional filtering
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'all']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status = 'approved', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = 'SELECT * FROM images';
    let params = [];

    // Add status filter if not 'all'
    if (status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    // Add search functionality
    if (req.query.search) {
      const whereClause = status !== 'all' ? ' AND' : ' WHERE';
      query += `${whereClause} (caption LIKE ? OR uploader_name LIKE ? OR roll_number LIKE ?)`;
      const searchTerm = `%${req.query.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [images] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM images';
    let countParams = [];

    if (status !== 'all') {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    if (req.query.search) {
      const whereClause = status !== 'all' ? ' AND' : ' WHERE';
      countQuery += `${whereClause} (caption LIKE ? OR uploader_name LIKE ? OR roll_number LIKE ?)`;
      const searchTerm = `%${req.query.search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      images,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalImages: total,
        hasNext: offset + images.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch images'
    });
  }
});

// Get single image
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [images] = await pool.execute(
      'SELECT * FROM images WHERE id = ?',
      [id]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.json({
      success: true,
      image: images[0]
    });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch image'
    });
  }
});

// Get image statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        status,
        COUNT(*) as count
      FROM images 
      GROUP BY status
    `);

    const summary = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      summary[stat.status] = stat.count;
      summary.total += stat.count;
    });

    res.json({
      success: true,
      stats: summary
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
