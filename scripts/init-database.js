const mongoose = require('mongoose');
require('dotenv').config();

const initDatabase = async () => {
  try {
    console.log('🚀 Initializing database...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get database instance
    const db = mongoose.connection.db;

    // List existing collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Existing collections:', collections.map(c => c.name).join(', ') || 'None');

    // Create collections if they don't exist
    const requiredCollections = ['users', 'projects', 'portfolios', 'alerts', 'whalewallets'];
    
    for (const collectionName of requiredCollections) {
      const exists = collections.some(c => c.name === collectionName);
      if (!exists) {
        await db.createCollection(collectionName);
        console.log(`✅ Created collection: ${collectionName}`);
      } else {
        console.log(`ℹ️  Collection already exists: ${collectionName}`);
      }
    }

    // Create indexes
    console.log('\n🔍 Creating indexes...');

    // Helper function to create index safely
    const createIndexSafe = async (collection, spec, options = {}) => {
      try {
        await collection.createIndex(spec, options);
        return true;
      } catch (error) {
        if (error.code === 86 || error.code === 85) { // Index already exists or conflicts
          return false;
        }
        throw error;
      }
    };

    // User indexes
    const usersCollection = db.collection('users');
    await createIndexSafe(usersCollection, { email: 1 }, { unique: true, sparse: true });
    await createIndexSafe(usersCollection, { username: 1 }, { unique: true });
    await createIndexSafe(usersCollection, { walletAddress: 1 }, { unique: true, sparse: true });
    console.log('✅ Processed indexes for users collection');

    // Project indexes
    const projectsCollection = db.collection('projects');
    await createIndexSafe(projectsCollection, { symbol: 1 });
    await createIndexSafe(projectsCollection, { category: 1 });
    await createIndexSafe(projectsCollection, { 'marketData.marketCap': -1 });
    await createIndexSafe(projectsCollection, { 'metrics.trendingScore': -1 });
    await createIndexSafe(projectsCollection, { name: 'text', description: 'text' });
    console.log('✅ Processed indexes for projects collection');

    // Portfolio indexes
    const portfoliosCollection = db.collection('portfolios');
    await createIndexSafe(portfoliosCollection, { userId: 1, name: 1 }, { unique: true });
    await createIndexSafe(portfoliosCollection, { userId: 1, createdAt: -1 });
    await createIndexSafe(portfoliosCollection, { totalValue: -1 });
    console.log('✅ Processed indexes for portfolios collection');

    // Alert indexes
    const alertsCollection = db.collection('alerts');
    await createIndexSafe(alertsCollection, { userId: 1, isActive: 1 });
    await createIndexSafe(alertsCollection, { type: 1, isActive: 1 });
    await createIndexSafe(alertsCollection, { projectId: 1 });
    await createIndexSafe(alertsCollection, { whaleWalletId: 1 });
    console.log('✅ Processed indexes for alerts collection');

    // WhaleWallet indexes
    const whaleWalletsCollection = db.collection('whalewallets');
    await createIndexSafe(whaleWalletsCollection, { address: 1 });
    await createIndexSafe(whaleWalletsCollection, { balanceUSD: -1 });
    await createIndexSafe(whaleWalletsCollection, { lastActivity: -1 });
    await createIndexSafe(whaleWalletsCollection, { 'transactions.timestamp': -1 });
    console.log('✅ Processed indexes for whalewallets collection');

    // Database statistics
    console.log('\n📊 Database Statistics:');
    const stats = await db.stats();
    console.log(`   Database: ${db.databaseName}`);
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Indexes: ${stats.indexes}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✅ Database initialization completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
};

// Run the initialization
initDatabase();