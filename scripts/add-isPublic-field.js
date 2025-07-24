const mongoose = require('mongoose')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config({ path: '.env.local' })

async function addIsPublicField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI )
    console.log('Connected to MongoDB')

    const db = mongoose.connection.db
    const projectsCollection = db.collection('projects')

    // Update all projects that don't have isPublic field
    const result = await projectsCollection.updateMany(
      { isPublic: { $exists: false } },
      { $set: { isPublic: false } }
    )

    console.log(`Updated ${result.modifiedCount} projects with isPublic field`)

    // Verify the update
    const totalProjects = await projectsCollection.countDocuments()
    const publicProjects = await projectsCollection.countDocuments({ isPublic: true })
    const privateProjects = await projectsCollection.countDocuments({ isPublic: false })

    console.log(`Total projects: ${totalProjects}`)
    console.log(`Public projects: ${publicProjects}`)
    console.log(`Private projects: ${privateProjects}`)

    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

addIsPublicField()