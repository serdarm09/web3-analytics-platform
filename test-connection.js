const connectDB = require('./config/database');

const testConnection = async () => {
  console.log('Testing database connection...');
  await connectDB();
  console.log('Connection test successful!');
  process.exit(0);
};

testConnection().catch(err => {
  console.error('Connection test failed:', err);
  process.exit(1);
});