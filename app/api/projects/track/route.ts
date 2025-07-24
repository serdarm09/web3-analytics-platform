import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Check if project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user already tracks this project
    const user = await User.findById(authResult.userId)
    if (user?.trackedProjects?.includes(projectId)) {
      return NextResponse.json(
        { error: 'You already track this project' },
        { status: 400 }
      )
    }

    // If the project is not public and user is not the creator, deny access
    if (!project.isPublic && project.addedBy !== authResult.userId) {
      return NextResponse.json(
        { error: 'This project is private' },
        { status: 403 }
      )
    }

    // Add project to user's tracked projects
    const updatedUser = await User.findByIdAndUpdate(
      authResult.userId,
      { $addToSet: { trackedProjects: projectId } },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update project stats for trending
    await Project.findByIdAndUpdate(
      projectId,
      {
        $inc: { addCount: 1 },
        $set: { lastAdded: new Date() },
        $addToSet: { addedBy: authResult.userId }
      }
    )

    // Activity tracking is handled by the Project model update above

    return NextResponse.json({ 
      message: 'Project added to tracking list',
      isTracked: true 
    })
  } catch (error) {
    console.error('Error tracking project:', error)
    return NextResponse.json(
      { error: 'Failed to track project' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Remove project from user's tracked projects
    const user = await User.findByIdAndUpdate(
      authResult.userId,
      { $pull: { trackedProjects: projectId } },
      { new: true }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      message: 'Project removed from tracking list',
      isTracked: false 
    })
  } catch (error) {
    console.error('Error untracking project:', error)
    return NextResponse.json(
      { error: 'Failed to untrack project' },
      { status: 500 }
    )
  }
}
