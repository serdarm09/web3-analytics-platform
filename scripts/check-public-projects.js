const mongoose = require('mongoose')
const Project = require('../models/Project').default
require('dotenv').config({ path: '.env.local' })

async function checkPublicProjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')
    
    // Get all projects
    const allProjects = await Project.find({}, 'name symbol isPublic addedBy').populate('addedBy', 'email username')
    
    console.log('\n=== ALL PROJECTS ===')
    console.log(`Total projects: ${allProjects.length}`)
    
    // Count public vs private
    const publicProjects = allProjects.filter(p => p.isPublic === true)
    const privateProjects = allProjects.filter(p => p.isPublic !== true)
    
    console.log(`Public projects: ${publicProjects.length}`)
    console.log(`Private projects: ${privateProjects.length}`)
    
    console.log('\n=== PUBLIC PROJECTS ===')
    publicProjects.forEach(p => {
      console.log(`- ${p.name} (${p.symbol}) - Created by: ${p.addedBy?.email || p.addedBy?.username || 'Unknown'}`)
    })
    
    console.log('\n=== PRIVATE PROJECTS ===')
    privateProjects.forEach(p => {
      console.log(`- ${p.name} (${p.symbol}) - isPublic: ${p.isPublic} - Created by: ${p.addedBy?.email || p.addedBy?.username || 'Unknown'}`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
  }
}

checkPublicProjects()