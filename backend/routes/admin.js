const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Approve image validation
const approveValidation = [
  body('action').isIn(['approve', 'reject']).withMessage('Action must be either approve or reject'),
  body('rejection_reason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
];

// Approve or reject image
router.patch('/images/:id/approve', approveValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { action, rejection_reason } = req.body;

    // Check if image exists
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

    const image = images[0];

    // Check if image is already processed
    if (image.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Image is already ${image.status}`
      });
    }

    // Validate rejection reason for reject action
    if (action === 'reject' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an image'
      });
    }

    // Update image status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updateFields = action === 'approve' 
      ? 'status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ?'
      : 'status = ?, rejection_reason = ?, approved_by = ?';
    
    const updateParams = action === 'approve'
      ? [newStatus, req.user.username]
      : [newStatus, rejection_reason, req.user.username];

    await pool.execute(
      `UPDATE images SET ${updateFields} WHERE id = ?`,
      [...updateParams, id]
    );

    res.json({
      success: true,
      message: `Image ${action}d successfully`,
      image: {
        id: image.id,
        status: newStatus,
        approved_by: req.user.username,
        approved_at: new Date(),
        ...(action === 'reject' && { rejection_reason })
      }
    });

  } catch (error) {
    console.error('Approve/reject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process image approval'
    });
  }
});

// Bulk approve/reject images
router.patch('/images/bulk', [
  body('image_ids').isArray({ min: 1 }).withMessage('Image IDs array is required'),
  body('action').isIn(['approve', 'reject']).withMessage('Action must be either approve or reject'),
  body('rejection_reason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
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

    const { image_ids, action, rejection_reason } = req.body;

    // Validate rejection reason for reject action
    if (action === 'reject' && !rejection_reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting images'
      });
    }

    // Check if all images exist and are pending
    const placeholders = image_ids.map(() => '?').join(',');
    const [images] = await pool.execute(
      `SELECT id, status FROM images WHERE id IN (${placeholders})`,
      image_ids
    );

    if (images.length !== image_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'Some images not found'
      });
    }

    const nonPendingImages = images.filter(img => img.status !== 'pending');
    if (nonPendingImages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some images are not in pending status',
        nonPendingImages: nonPendingImages.map(img => ({ id: img.id, status: img.status }))
      });
    }

    // Update all images
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const updateFields = action === 'approve' 
      ? 'status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ?'
      : 'status = ?, rejection_reason = ?, approved_by = ?';
    
    const updateParams = action === 'approve'
      ? [newStatus, req.user.username]
      : [newStatus, rejection_reason, req.user.username];

    await pool.execute(
      `UPDATE images SET ${updateFields} WHERE id IN (${placeholders})`,
      [...updateParams, ...image_ids]
    );

    res.json({
      success: true,
      message: `${images.length} images ${action}d successfully`,
      processedCount: images.length
    });

  } catch (error) {
    console.error('Bulk approve/reject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk approval'
    });
  }
});

// Get admin dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get statistics
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

    // Get recent pending images
    const [pendingImages] = await pool.execute(`
      SELECT * FROM images 
      WHERE status = 'pending' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Get recent activity
    const [recentActivity] = await pool.execute(`
      SELECT 
        id, filename, uploader_name, status, 
        approved_at, approved_by, rejection_reason,
        created_at
      FROM images 
      WHERE status IN ('approved', 'rejected')
      ORDER BY approved_at DESC 
      LIMIT 20
    `);

    res.json({
      success: true,
      dashboard: {
        summary,
        pendingImages,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Delete image (admin only)
router.delete('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if image exists
    const [images] = await pool.execute(
      'SELECT filename FROM images WHERE id = ?',
      [id]
    );

    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from database
    await pool.execute('DELETE FROM images WHERE id = ?', [id]);

    // Delete file from filesystem
    const fs = require('fs').promises;
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', images[0].filename);
    
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.warn('Failed to delete file:', fileError.message);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
});

// Get all users (students and admins)
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, username, email, role, roll_number, full_name, department, year, is_active, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `);

    // Separate students and admins
    const students = users.filter(user => user.role === 'student');
    const admins = users.filter(user => user.role === 'admin');

    res.json({
      success: true,
      users: {
        students,
        admins,
        total: users.length,
        studentCount: students.length,
        adminCount: admins.length
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get student statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total students
    const [studentCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "student" AND is_active = TRUE'
    );

    // Get total images
    const [imageCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM images'
    );

    // Get pending images
    const [pendingCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM images WHERE status = "pending"'
    );

    // Get approved images
    const [approvedCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM images WHERE status = "approved"'
    );

    // Get rejected images
    const [rejectedCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM images WHERE status = "rejected"'
    );

    // Get total assignments
    const [assignmentCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM assignments WHERE is_active = TRUE'
    );

    res.json({
      success: true,
      stats: {
        totalStudents: studentCount[0].count,
        totalImages: imageCount[0].count,
        pendingImages: pendingCount[0].count,
        approvedImages: approvedCount[0].count,
        rejectedImages: rejectedCount[0].count,
        totalAssignments: assignmentCount[0].count
      }
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
