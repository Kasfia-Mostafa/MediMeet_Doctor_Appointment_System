/**
 * ============================================================
 * MediMeet Backend Server — Entry Point
 * ============================================================
 * 
 * This is the main entry file for the MediMeet Express.js
 * backend server. It initializes the Express app, registers
 * all middleware (CORS, JSON parsing, cookies), mounts API
 * route modules, and starts listening on the configured port.
 * 
 * A background cron job (expiryJob) is also started to
 * automatically expire past-due appointments.
 * ============================================================
 */

// ── Core Dependencies ──────────────────────────────────────
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// ── Internal Modules ───────────────────────────────────────
const connectDB = require('./config/db');                // MongoDB connection handler
const errorHandler = require('./middleware/errorHandler'); // Global error-handling middleware
const scheduleExpiryCheck = require('./utils/expiryJob'); // Cron job for expiring stale appointments

// Load environment variables from .env file
dotenv.config();


// ── Express App Initialization ─────────────────────────────
const app = express();

// ── Global Middleware ──────────────────────────────────────
// Enable CORS for the frontend origin with credentials (cookies)
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
// Parse incoming JSON request bodies
app.use(express.json());
// Parse URL-encoded form data (e.g., from HTML forms)
app.use(express.urlencoded({ extended: true }));
// Parse cookies attached to incoming requests
app.use(cookieParser());

// ── API Route Mounting ─────────────────────────────────────
// Each route module handles a specific domain of the application
app.use('/api/auth', require('./routes/authRoutes'));               // Authentication (register, login, logout, refresh)
app.use('/api/users', require('./routes/userRoutes'));              // User profile management
app.use('/api/doctors', require('./routes/doctorRoutes'));          // Doctor listings, schedules, patients
app.use('/api/appointments', require('./routes/appointmentRoutes')); // Appointment CRUD operations
app.use('/api/records', require('./routes/recordRoutes'));          // Medical records management
app.use('/api/billing', require('./routes/billingRoutes'));         // Billing and invoice management
app.use('/api/blogs', require('./routes/blogRoutes'));              // Public blog/article endpoints
app.use('/api/contact', require('./routes/contactRoutes'));         // Contact form submissions
app.use('/api/admin', require('./routes/adminRoutes'));             // Admin panel operations
app.use('/api/reviews', require('./routes/reviewRoutes'));          // Doctor review system
app.use('/api/payments', require('./routes/paymentRoutes'));        // Stripe payment processing
app.use('/api/wellness', require('./routes/wellnessRoutes'));       // Patient wellness tracker

// ── Health Check Endpoint ──────────────────────────────────
// Used for monitoring/uptime checks to verify the server is running
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Global Error Handler ───────────────────────────────────
// Must be registered AFTER all routes to catch unhandled errors
app.use(errorHandler);

/**
 * Starts the server by:
 * 1. Connecting to MongoDB
 * 2. Listening on the configured PORT
 * 3. Starting the appointment expiry cron job
 */
const start = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    scheduleExpiryCheck(); // Start the background job
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
  }
};

start();
