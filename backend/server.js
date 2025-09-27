const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase } = require('./config/database');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initDatabase().catch(console.error);

// CORS configuration - more permissive for development (moved before helmet)
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Security middleware (disabled for development to avoid CORS conflicts)
// app.use(helmet());

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting - disabled for development to prevent 429 errors
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Very high limit for development
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for all API routes during development
    return req.path.startsWith('/api/') || req.path.startsWith('/uploads/');
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/images', require('./routes/images'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/assignments', require('./routes/assignments'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Image Gallery API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
});
