const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get production statistics with optional filtering
router.get('/stats', async (req, res) => {
  try {
    const { productionLine, dateFrom, dateTo } = req.query;
    
    // Build match stage for aggregation
    const matchStage = {};
    
    // Validate and add production line filter
    if (productionLine) {
      const validLines = ['assembly-1', 'packaging-2', 'qc-3'];
      if (!validLines.includes(productionLine)) {
        return res.status(400).json({ 
          error: 'Invalid production line',
          message: 'Production line must be one of: ' + validLines.join(', ')
        });
      }
      matchStage.productionLine = productionLine;
    }
    
    // Validate and add date range filter
    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ 
            error: 'Invalid dateFrom parameter',
            message: 'dateFrom must be a valid date string'
          });
        }
        matchStage.createdAt.$gte = fromDate;
      }
      
      if (dateTo) {
        const toDate = new Date(dateTo);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ 
            error: 'Invalid dateTo parameter',
            message: 'dateTo must be a valid date string'
          });
        }
        matchStage.createdAt.$lte = toDate;
      }
    }

    const pipeline = [];
    
    // Add match stage if there are filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({
      $group: {
        _id: '$productionLine',
        total: { $sum: 1 },
        approved: { 
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } 
        },
        rejected: { 
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } 
        },
        pending: { 
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
        },
        avgInspectionTime: { $avg: '$inspectionTime' },
        avgDefectProbability: { 
          $avg: { 
            $cond: [{ $ne: ['$defectProbability', null] }, '$defectProbability', 0] 
          } 
        }
      }
    });
    
    pipeline.push({ $sort: { _id: 1 } });

    const stats = await Product.aggregate(pipeline);
    
    // Calculate overall statistics
    const overall = stats.reduce((acc, stat) => {
      acc.total += stat.total;
      acc.approved += stat.approved;
      acc.rejected += stat.rejected;
      acc.pending += stat.pending;
      return acc;
    }, { total: 0, approved: 0, rejected: 0, pending: 0 });
    
    res.json({
      byProductionLine: stats,
      overall: {
        ...overall,
        approvalRate: overall.total > 0 ? (overall.approved / overall.total * 100).toFixed(2) : 0,
        rejectionRate: overall.total > 0 ? (overall.rejected / overall.total * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching production stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch production stats',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { limit = '50', page = '1', line, status } = req.query;
    
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
    const query = {};
    
    if (line) {
      const validLines = ['assembly-1', 'packaging-2', 'qc-3'];
      if (!validLines.includes(line)) {
        return res.status(400).json({ 
          error: 'Invalid production line',
          message: 'Production line must be one of: ' + validLines.join(', ')
        });
      }
      query.productionLine = line;
    }
    
    if (status) {
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: 'Invalid status',
          message: 'Status must be one of: ' + validStatuses.join(', ')
        });
      }
      query.status = status;
    }

    const skip = (pageNum - 1) * limitNum;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);
      
    res.json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;