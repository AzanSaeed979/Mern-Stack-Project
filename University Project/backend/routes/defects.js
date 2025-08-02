const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Defect = require('../models/Defect');
const Product = require('../models/Product');

// Input validation middleware
const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ 
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid ObjectId'
    });
  }
  next();
};

// Get all defects with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      resolved = 'false', 
      limit = '50', 
      page = '1', 
      productionLine,
      defectType 
    } = req.query;

    // Validate query parameters
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ 
        error: 'Invalid limit parameter',
        message: 'Limit must be a number between 1 and 100'
      });
    }
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ 
        error: 'Invalid page parameter',
        message: 'Page must be a positive number'
      });
    }

    // Build query filter
    const filter = {};
    if (resolved === 'true') filter.resolved = true;
    else if (resolved === 'false') filter.resolved = false;
    
    if (productionLine) {
      const validLines = ['assembly-1', 'packaging-2', 'qc-3'];
      if (!validLines.includes(productionLine)) {
        return res.status(400).json({ 
          error: 'Invalid production line',
          message: 'Production line must be one of: ' + validLines.join(', ')
        });
      }
      filter.productionLine = productionLine;
    }
    
    if (defectType) {
      const validTypes = ['crack', 'scratch', 'dent', 'deformation', 'discoloration'];
      if (!validTypes.includes(defectType)) {
        return res.status(400).json({ 
          error: 'Invalid defect type',
          message: 'Defect type must be one of: ' + validTypes.join(', ')
        });
      }
      filter.defectType = defectType;
    }

    const skip = (pageNum - 1) * limitNum;
    
    const [defects, total] = await Promise.all([
      Defect.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('productId', 'productName productionLine status'),
      Defect.countDocuments(filter)
    ]);
      
    res.json({
      defects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching defects:', error);
    res.status(500).json({ 
      error: 'Failed to fetch defects',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Mark defect as resolved
router.put('/:id/resolve', validateObjectId, async (req, res) => {
  try {
    const { resolvedBy } = req.body;
    
    // Validate resolvedBy if provided
    if (resolvedBy && (typeof resolvedBy !== 'string' || resolvedBy.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'Invalid resolvedBy parameter',
        message: 'resolvedBy must be a non-empty string'
      });
    }

    // Check if defect exists and is not already resolved
    const existingDefect = await Defect.findById(req.params.id);
    if (!existingDefect) {
      return res.status(404).json({ 
        error: 'Defect not found',
        message: 'No defect found with the provided ID'
      });
    }

    if (existingDefect.resolved) {
      return res.status(400).json({ 
        error: 'Defect already resolved',
        message: 'This defect has already been marked as resolved'
      });
    }

    // Update defect with resolution details
    const updateData = {
      resolved: true,
      resolvedAt: new Date()
    };
    
    if (resolvedBy) {
      updateData.resolvedBy = resolvedBy.trim();
    }

    const defect = await Defect.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('productId', 'productName productionLine status');
    
    res.json({
      message: 'Defect resolved successfully',
      defect
    });
  } catch (error) {
    console.error('Error resolving defect:', error);
    res.status(500).json({ 
      error: 'Failed to resolve defect',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get defect types distribution
router.get('/distribution', async (req, res) => {
  try {
    const distribution = await Defect.aggregate([
      { $match: { resolved: false } },
      { $group: { 
          _id: '$defectType', 
          count: { $sum: 1 },
          avgProbability: { $avg: '$probability' }
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get defect distribution' });
  }
});

module.exports = router;