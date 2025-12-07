const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Uses the environment variable MONGO_URI if available, otherwise falls back to your Atlas connection string.
    const uri = process.env.MONGO_URI || 'mongodb+srv://adminSafar:12345678Abc@cluster0.xvker.mongodb.net/jhfya?appName=Cluster0';
    
    const conn = await mongoose.connect(uri, {
      // Connection options
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    console.log(`  Database: ${conn.connection.name}`);
    console.log(`  Connection State: ${getConnectionState(mongoose.connection.readyState)}`);
    
    // Listen for connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (error) {
    console.error(`✗ MongoDB Connection Error: ${error.message}`);
    console.error("  Please check your IP Whitelist in MongoDB Atlas or your internet connection.");
    console.error(`  Connection State: ${getConnectionState(mongoose.connection.readyState)}`);
    // Do not exit process, so the Express server can still start and respond with errors
    // process.exit(1); 
  }
};

// Helper function to get connection state string
const getConnectionState = (readyState) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[readyState] || 'unknown';
};

module.exports = connectDB;