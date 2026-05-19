/**
 * ============================================================
 * Database Configuration — MongoDB Connection
 * ============================================================
 * 
 * Establishes a connection to MongoDB using Mongoose.
 * The connection URI is read from the MONGO_URI environment
 * variable. If the connection fails, the process exits with
 * code 1 to prevent the server from running without a database.
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * Connects to the MongoDB database.
 * Logs the host on success or exits the process on failure.
 * 
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit with failure code — database is required
  }
};

module.exports = connectDB;
