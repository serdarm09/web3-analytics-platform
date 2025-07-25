import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    // Get all projects
    const allProjects = await Project.find({})
      .select('name symbol isPublic addedBy createdAt')
      .populate('addedBy', 'email username name')
      .lean()
    
    // Count public vs private
    const publicProjects = allProjects.filter(p => p.isPublic === true)
    const privateProjects = allProjects.filter(p => p.isPublic !== true)
    
    const response = {
      summary: {
        total: allProjects.length,
        public: publicProjects.length,
        private: privateProjects.length
      },
      publicProjects: publicProjects.map(p => ({
        name: p.name,
        symbol: p.symbol,
        isPublic: p.isPublic,
        createdBy: typeof p.addedBy === 'object' && p.addedBy ? 
          ((p.addedBy as any).email || (p.addedBy as any).username || (p.addedBy as any).name || 'Unknown') : 
          'Unknown',
        createdAt: p.createdAt
      })),
      privateProjects: privateProjects.map(p => ({
        name: p.name,
        symbol: p.symbol,
        isPublic: p.isPublic,
        createdBy: typeof p.addedBy === 'object' && p.addedBy ? 
          ((p.addedBy as any).email || (p.addedBy as any).username || (p.addedBy as any).name || 'Unknown') : 
          'Unknown',
        createdAt: p.createdAt
      }))
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error checking public projects:', error)
    return NextResponse.json(
      { error: 'Failed to check projects' },
      { status: 500 }
    )
  }
}