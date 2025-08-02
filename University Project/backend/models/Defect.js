const mongoose = require('mongoose');

const defectSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: [true, 'Product ID is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Product ID must be a valid ObjectId'
    }
  },
  defectType: { 
    type: String, 
    required: [true, 'Defect type is required'],
    enum: {
      values: ['crack', 'scratch', 'dent', 'deformation', 'discoloration'],
      message: 'Invalid defect type'
    },
    trim: true
  },
  probability: { 
    type: Number, 
    required: [true, 'Probability is required'],
    min: [0, 'Probability cannot be negative'],
    max: [1, 'Probability cannot exceed 1']
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
  productionLine: { 
    type: String, 
    required: [true, 'Production line is required'],
    enum: {
      values: ['assembly-1', 'packaging-2', 'qc-3'],
      message: 'Production line must be one of: assembly-1, packaging-2, qc-3'
    }
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String,
    trim: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Defect', defectSchema);