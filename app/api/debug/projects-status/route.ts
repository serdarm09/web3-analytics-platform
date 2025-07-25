import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Check authentication status
    let authStatus = null
    try {
      authStatus = await verifyAuth(request)
    } catch (e) {
      // Ignore auth errors
    }
    
    // Get counts
    const totalProjects = await Project.countDocuments({})
    const publicProjects = await Project.countDocuments({ isPublic: true })
    const privateProjects = await Project.countDocuments({ isPublic: { $ne: true } })
    
    // Get sample projects
    const samplePublicProjects = await Project.find({ isPublic: true })
      .limit(5)
      .select('name symbol isPublic createdAt')
      .lean()
    
    return NextResponse.json({
      authStatus: {
        authenticated: authStatus?.authenticated || false,
        userId: authStatus?.userId || null
      },
      counts: {
        total: totalProjects,
        public: publicProjects,
        private: privateProjects
      },
      samplePublicProjects: samplePublicProjects.map(p => ({
        name: p.name,
        symbol: p.symbol,
        isPublic: p.isPublic,
        createdAt: p.createdAt
      })),
      apiTest: {
        publicEndpoint: '/api/projects?public=true',
        message: 'This endpoint should return all public projects without authentication'
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}