const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productionLine: { 
    type: String, 
    required: [true, 'Production line is required'],
    enum: {
      values: ['assembly-1', 'packaging-2', 'qc-3'],
      message: 'Production line must be one of: assembly-1, packaging-2, qc-3'
    }
  },
  productName: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be one of: pending, approved, rejected'
    },
    default: 'pending'
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image URL must be a valid HTTP/HTTPS URL'
    }
  },
  defectProbability: { 
    type: Number,
    min: [0, 'Defect probability cannot be negative'],
    max: [1, 'Defect probability cannot exceed 1']
  },
  defectType: { 
    type: String,
    enum: {
      values: ['crack', 'scratch', 'dent', 'deformation', 'discoloration', 'none'],
      message: 'Invalid defect type'
    }
  },
  inspectionTime: {
    type: Number,
    default: 0,
    min: [0, 'Inspection time cannot be negative']
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Product', productSchema);