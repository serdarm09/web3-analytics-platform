const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('Testing database connection...');
  console.log('Connection string:', process.env.MONGODB_URI);
  
  try {
    // Mongoose debug mode
    mongoose.set('debug', true);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // List databases to verify connection
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    console.log('Available databases:', databases.databases.map(db => db.name));
    
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    process.exit(1);
  }
};

testConnection();