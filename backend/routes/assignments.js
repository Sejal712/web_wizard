const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken, requireAdmin } = require('./auth');

const router = express.Router();

// Public route to get active assignments (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const [assignments] = await pool.execute(`
      SELECT id, title, description, instructions, due_date, max_images, is_active, created_at
      FROM assignments 
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('Get public assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

// Apply authentication middleware to all other assignment routes
router.use(authenticateToken);

// Create assignment (admin only)
router.post('/create', requireAdmin, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('instructions').optional().isLength({ max: 2000 }).withMessage('Instructions must be less than 2000 characters'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('max_images').optional().isInt({ min: 1, max: 10 }).withMessage('Max images must be between 1 and 10'),
  body('compress_images').optional().isBoolean().withMessage('Compress images must be a boolean value')
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

    const { title, description, instructions, due_date, max_images, compress_images } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO assignments (title, description, instructions, due_date, max_images, compress_images, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, instructions || null, due_date || null, max_images || 1, compress_images !== false, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment: {
        id: result.insertId,
        title,
        description,
        instructions,
        due_date,
        max_images: max_images || 1,
        created_by: req.user.id
      }
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assignment'
    });
  }
});

// Get all assignments (admin and students)
router.get('/', async (req, res) => {
  try {
    const [assignments] = await pool.execute(`
      SELECT a.*, u.full_name as created_by_name 
      FROM assignments a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.is_active = TRUE 
      ORDER BY a.created_at DESC
    `);

    res.json({
      success: true,
      assignments
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignments'
    });
  }
});

// Get assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [assignments] = await pool.execute(`
      SELECT a.*, u.full_name as created_by_name 
      FROM assignments a 
      LEFT JOIN users u ON a.created_by = u.id 
      WHERE a.id = ? AND a.is_active = TRUE
    `, [id]);

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.json({
      success: true,
      assignment: assignments[0]
    });

  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment'
    });
  }
});

// Update assignment (admin only)
router.put('/:id', requireAdmin, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('instructions').optional().isLength({ max: 2000 }).withMessage('Instructions must be less than 2000 characters'),
  body('due_date').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('max_images').optional().isInt({ min: 1, max: 10 }).withMessage('Max images must be between 1 and 10'),
  body('compress_images').optional().isBoolean().withMessage('Compress images must be a boolean value'),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
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

    const { id } = req.params;
    const { title, description, instructions, due_date, max_images, compress_images, is_active } = req.body;

    // Check if assignment exists
    const [existingAssignments] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ?',
      [id]
    );

    if (existingAssignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (instructions !== undefined) {
      updateFields.push('instructions = ?');
      updateValues.push(instructions);
    }
    if (due_date !== undefined) {
      updateFields.push('due_date = ?');
      updateValues.push(due_date);
    }
    if (max_images !== undefined) {
      updateFields.push('max_images = ?');
      updateValues.push(max_images);
    }
    if (compress_images !== undefined) {
      updateFields.push('compress_images = ?');
      updateValues.push(compress_images);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE assignments SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Assignment updated successfully'
    });

  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update assignment'
    });
  }
});

// Delete assignment (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if assignment exists
    const [existingAssignments] = await pool.execute(
      'SELECT id FROM assignments WHERE id = ?',
      [id]
    );

    if (existingAssignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE assignments SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });

  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assignment'
    });
  }
});

// Get assignment statistics (admin only)
router.get('/stats/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get assignment details
    const [assignments] = await pool.execute(
      'SELECT * FROM assignments WHERE id = ?',
      [id]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Get submission statistics
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_submissions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_submissions,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_submissions,
        COUNT(DISTINCT roll_number) as unique_students
      FROM images 
      WHERE assignment_id = ?
    `, [id]);

    res.json({
      success: true,
      assignment: assignments[0],
      stats: stats[0]
    });

  } catch (error) {
    console.error('Get assignment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assignment statistics'
    });
  }
});

module.exports = router;
