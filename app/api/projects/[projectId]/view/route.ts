import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import { verifyAuth } from '@/lib/auth/middleware'
import Project from '@/models/Project'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { projectId } = await context.params

    // Check if user has already viewed this project
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only increment view count if user hasn't viewed before
    const hasViewed = project.viewedBy?.includes(authResult.userId!) || false
    
    const updateQuery = hasViewed 
      ? {
          $set: { lastViewed: new Date() }
        }
      : {
          $inc: { viewCount: 1 },
          $set: { lastViewed: new Date() },
          $addToSet: { viewedBy: authResult.userId }
        }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateQuery,
      { new: true }
    )

    if (!updatedProject) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      viewCount: updatedProject.viewCount,
      isNewView: !hasViewed 
    })

  } catch (error) {
    console.error('Error tracking project view:', error)
    return NextResponse.json(
      { error: 'Failed to track project view' },
      { status: 500 }
    )
  }
}