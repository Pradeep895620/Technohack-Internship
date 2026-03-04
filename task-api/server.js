const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const tasksRouter = require('./routes/tasks.js');

const app = express();

// Middleware - ORDER MATTERS!
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log the router type to verify it's loaded correctly
console.log("tasksRouter type:", typeof tasksRouter);
console.log("Is router function:", typeof tasksRouter === 'function');

// Database connection
console.log("MongoDB URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ Could not connect to MongoDB:", err));

// Routes - Only ONCE!
app.use('/api/tasks', tasksRouter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler - This catches any routes that weren't matched
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware - This must have 4 parameters
app.use((err, req, res, next) => {
  console.error("Error occurred:", err);
  
  // Check if headers are already sent
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/tasks`);
  console.log(`   - POST http://localhost:${PORT}/api/tasks`);
});