const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const projectSchema = new mongoose.Schema({
  metrics: {
    socialScore: Number,
    trendingScore: Number,
    hypeScore: Number,
    starRating: Number,
    holders: Number
  },
  viewCount: Number,
  addCount: Number,
  likeCount: Number
}, { strict: false });

const Project = mongoose.model('Project', projectSchema);

async function migrateProjects() {
  try {
    console.log('Starting project metrics migration...');
    
    const projects = await Project.find({});
    console.log(`Found ${projects.length} projects to migrate`);
    
    for (const project of projects) {
      // Convert socialScore to starRating (0-100 to 0-10)
      const starRating = Math.round((project.metrics?.socialScore || 0) / 10);
      
      // Calculate trending score based on activity
      const viewScore = (project.viewCount || 0) * 1;
      const addScore = (project.addCount || 0) * 2;
      const likeScore = (project.likeCount || 0) * 3;
      const trendingScore = viewScore + addScore + likeScore;
      
      // Update the project
      await Project.updateOne(
        { _id: project._id },
        {
          $set: {
            'metrics.starRating': starRating,
            'metrics.trendingScore': trendingScore
          },
          $unset: {
            'metrics.socialScore': '',
            'metrics.hypeScore': ''
          }
        }
      );
      
      console.log(`Migrated project: ${project.name} - Star Rating: ${starRating}, Trending Score: ${trendingScore}`);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateProjects();