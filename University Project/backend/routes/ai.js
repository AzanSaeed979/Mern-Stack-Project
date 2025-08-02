const express = require('express');
const multer = require('multer');
const router = express.Router();
const { detectDefects } = require('../utils/aiModel');
const { uploadImage } = require('../utils/cloudinary');
const Product = require('../models/Product');
const Defect = require('../models/Defect');

const upload = multer();

// AI Inspection Endpoint
router.post('/inspect', upload.single('image'), async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Input validation
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please upload an image file for inspection'
      });
    }
    
    if (!req.body.lineId) {
      return res.status(400).json({ 
        error: 'Production line ID is required',
        message: 'Please specify the production line ID'
      });
    }
    
    // Validate production line
    const validLines = ['assembly-1', 'packaging-2', 'qc-3'];
    if (!validLines.includes(req.body.lineId)) {
      return res.status(400).json({ 
        error: 'Invalid production line',
        message: 'Production line must be one of: ' + validLines.join(', ')
      });
    }
    
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        message: 'Only JPEG, PNG, and WebP images are supported'
      });
    }
    
    // Validate file size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'Image file must be smaller than 10MB'
      });
    }
    
    console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // 1. Upload image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await uploadImage(req.file.buffer);
      console.log('Image uploaded to Cloudinary successfully');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({ 
        error: 'Image upload failed',
        message: 'Failed to upload image to cloud storage'
      });
    }
    
    // 2. Analyze with AI
    const aiResult = await detectDefects(req.file.buffer);
    
    // Handle AI detection errors
    if (aiResult.defectType === 'error') {
      return res.status(500).json({ 
        error: 'AI analysis failed',
        message: aiResult.error || 'Failed to analyze image with AI model'
      });
    }
    
    const { defectType, probability, confidence } = aiResult;
    
    // Determine status based on enhanced threshold logic
    const status = probability > 0.75 ? 'rejected' : 'approved';
    const inspectionTime = Date.now() - startTime;
    
    // Generate unique product name
    const timestamp = Date.now().toString(36).toUpperCase();
    const productName = `PROD-${req.body.lineId.split('-')[0]}-${timestamp}`;

    // 3. Save to database with enhanced data
    const product = new Product({
      productionLine: req.body.lineId,
      productName,
      imageUrl,
      defectType: defectType === 'none' ? undefined : defectType,
      defectProbability: probability,
      status,
      inspectionTime
    });
    
    await product.save();
    console.log(`Product saved: ${product._id}`);

    // 4. Create defect record if rejected
    let defectRecord = null;
    if (status === 'rejected' && defectType !== 'none') {
      defectRecord = new Defect({
        productId: product._id,
        defectType,
        probability,
        imageUrl,
        productionLine: req.body.lineId
      });
      await defectRecord.save();
      console.log(`Defect record created: ${defectRecord._id}`);
    }

    // 5. Prepare response
    const response = {
      success: true,
      productId: product._id,
      status,
      defectType: defectType === 'none' ? null : defectType,
      probability: Math.round(probability * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      imageUrl,
      inspectionTime,
      productName,
      productionLine: req.body.lineId,
      timestamp: new Date().toISOString()
    };
    
    if (defectRecord) {
      response.defectId = defectRecord._id;
    }
    
    // Add debug info in development
    if (process.env.NODE_ENV === 'development' && aiResult.allPredictions) {
      response.debug = {
        allPredictions: aiResult.allPredictions,
        threshold: aiResult.threshold
      };
    }

    res.json(response);
    
  } catch (error) {
    console.error('Inspection error:', error);
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        message: error.message,
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({ 
      error: 'AI inspection failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;