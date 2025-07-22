const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testDirectConnection() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB!');
    
    const database = client.db('web3platform');
    const collections = await database.listCollections().toArray();
    console.log('Collections in web3platform:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('Direct MongoDB connection failed:');
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.close();
  }
}

testDirectConnection();