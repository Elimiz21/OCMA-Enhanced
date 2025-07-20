const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const contentRoutes = require('./routes/content-routes');
const strategyRoutes = require('./routes/strategy-routes');
const visualRoutes = require('./routes/visual-routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'OCMA Enhanced Backend'
  });
});

// API Routes
app.use('/api/content', contentRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/visual', visualRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File size too large',
        message: 'Please upload a file smaller than 10MB'
      });
    }
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OCMA Enhanced Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Endpoints:`);
  console.log(`   📋 Content: http://localhost:${PORT}/api/content`);
  console.log(`   🎯 Strategy: http://localhost:${PORT}/api/strategy`);
  console.log(`   🎨 Visual: http://localhost:${PORT}/api/visual`);
});

module.exports = app;