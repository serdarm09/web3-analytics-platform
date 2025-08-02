import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database/mongoose'
import Project from '@/models/Project'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

// Helper function to verify admin token
async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value

  if (!token) {
    throw new Error('No authentication token')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await User.findById(decoded.userId || decoded.id)
    
    if (!user || user.role !== 'admin') {
      throw new Error('Admin access required')
    }

    return user
  } catch (error) {
    console.error('Admin verification error:', error)
    throw new Error('Invalid token or insufficient permissions')
  }
}

// GET - List all projects
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const query: any = {}

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    // Populate creator information
    const projects = await Project.find(query)
      .populate('addedBy', 'username email name isVerifiedCreator')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Transform the data to include creator info in the expected format
    const transformedProjects = projects.map((project: any) => {
      const projectObj = project.toObject()
      return {
        ...projectObj,
        // Keep original addedBy for reference
        addedBy: project.addedBy,
        // Transform addedBy to createdBy format for compatibility
        createdBy: project.addedBy ? {
          userId: project.addedBy._id,
          username: project.addedBy.username,
          email: project.addedBy.email,
          name: project.addedBy.name,
          isVerifiedCreator: project.addedBy.isVerifiedCreator
        } : null
      }
    })

    const total = await Project.countDocuments(query)

    const stats = await Project.aggregate([
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          publicProjects: { $sum: { $cond: ['$isPublic', 1, 0] } },
          privateProjects: { $sum: { $cond: [{ $not: '$isPublic' }, 1, 0] } },
          totalViews: { $sum: { $ifNull: ['$views', '$viewCount', 0] } }
        }
      }
    ])

    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: stats[0] || {
        totalProjects: 0,
        publicProjects: 0,
        privateProjects: 0,
        totalViews: 0
      }
    })

  } catch (error: any) {
    console.error('Admin projects fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const deletedProject = await Project.findByIdAndDelete(projectId)
    
    if (!deletedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Remove project from all users' tracked projects
    await User.updateMany(
      { trackedProjects: projectId },
      { $pull: { trackedProjects: projectId } }
    )

    return NextResponse.json({ 
      message: 'Project deleted successfully',
      project: deletedProject
    })

  } catch (error: any) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.message.includes('Admin') ? 403 : 500 }
    )
  }
}
