const sharp = require('sharp');

let model;
let isModelLoaded = false;

const loadModel = async () => {
  try {
    // Mock model loading - replace with actual TensorFlow when build tools are available
    console.log('Loading AI model...');
    
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    model = {
      classify: async (tensor) => {
        // Mock classification results
        return [
          { className: 'normal', probability: 0.95 },
          { className: 'crack', probability: 0.03 },
          { className: 'scratch', probability: 0.02 }
        ];
      }
    };
    
    isModelLoaded = true;
    console.log('Mock AI Model loaded successfully');
  } catch (error) {
    console.error('Failed to load AI model:', error.message);
    throw error;
  }
};

const detectDefects = async (imageBuffer) => {
  try {
    if (!isModelLoaded) {
      throw new Error('AI model not loaded. Please wait for model initialization.');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Invalid image buffer provided');
    }

    // Validate image buffer size (max 10MB)
    if (imageBuffer.length > 10 * 1024 * 1024) {
      throw new Error('Image file too large. Maximum size is 10MB.');
    }

    // Preprocess image with better error handling
    let processedBuffer;
    try {
      processedBuffer = await sharp(imageBuffer)
        .resize(224, 224, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 90,
          progressive: true
        })
        .toBuffer();
        
      console.log(`Image preprocessed: ${imageBuffer.length} bytes -> ${processedBuffer.length} bytes`);
    } catch (error) {
      console.error('Image preprocessing error:', error.message);
      throw new Error('Failed to process image. Please ensure it is a valid image file.');
    }
    
    // Mock prediction with more realistic results
    const predictions = await model.classify(processedBuffer);
    
    // Enhanced defect detection with consistent thresholds
    const DEFECT_THRESHOLD = 0.75; // Consistent threshold for all defect types
    const defectTypes = ['crack', 'scratch', 'dent', 'deformation', 'discoloration'];
    
    // Find the highest probability defect above threshold
    let detectedDefect = null;
    let maxProbability = 0;
    
    for (const prediction of predictions) {
      const defectType = prediction.className.toLowerCase();
      
      // Skip 'normal' predictions
      if (defectType === 'normal') continue;
      
      // Check if it's a valid defect type and above threshold
      if (defectTypes.includes(defectType) && prediction.probability >= DEFECT_THRESHOLD) {
        if (prediction.probability > maxProbability) {
          maxProbability = prediction.probability;
          detectedDefect = {
            className: defectType,
            probability: prediction.probability
          };
        }
      }
    }
    
    // If no defect found above threshold, check if it's clearly normal
    const normalPrediction = predictions.find(p => p.className.toLowerCase() === 'normal');
    const isNormal = normalPrediction && normalPrediction.probability >= 0.8;
    
    const result = {
      defectType: detectedDefect ? detectedDefect.className : 'none',
      probability: detectedDefect ? detectedDefect.probability : (isNormal ? 0 : 0.3),
      confidence: detectedDefect ? 
        Math.min(detectedDefect.probability * 100, 100) : 
        (isNormal ? Math.min(normalPrediction.probability * 100, 100) : 30),
      allPredictions: predictions.map(p => ({
        type: p.className,
        probability: Math.round(p.probability * 100) / 100
      })),
      threshold: DEFECT_THRESHOLD,
      processingTime: Date.now() - Date.now() // Will be calculated in calling function
    };

    console.log('AI Detection Result:', {
      defectType: result.defectType,
      probability: result.probability,
      confidence: result.confidence
    });
    
    return result;
    
  } catch (error) {
    console.error('AI detection error:', error.message);
    
    // Return structured error response
    return { 
      defectType: 'error', 
      probability: 0,
      confidence: 0,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

const getModelStatus = () => ({
  loaded: isModelLoaded,
  timestamp: new Date().toISOString()
});

module.exports = { 
  loadModel, 
  detectDefects, 
  getModelStatus 
};