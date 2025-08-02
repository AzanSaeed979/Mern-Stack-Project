require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB (removed deprecated options)
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Load AI model
const { loadModel } = require('./utils/aiModel');
loadModel().catch(err => console.error('AI model loading failed:', err));

// Routes
const productionRoutes = require('./routes/production');
const defectRoutes = require('./routes/defects');
const aiRoutes = require('./routes/ai');

// Health check endpoint - must be defined before 404 handler
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount route handlers
app.use('/api/production', productionRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - must be last
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`Production: http://localhost:${PORT}/api/production`);
  console.log(`Defects: http://localhost:${PORT}/api/defects`);
  console.log(`AI Inspection: http://localhost:${PORT}/api/ai/inspect`);
});