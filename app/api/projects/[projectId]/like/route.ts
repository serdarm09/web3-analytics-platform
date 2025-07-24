import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user already liked this project
    const hasLiked = project.likedBy?.includes(authResult.userId)

    if (hasLiked) {
      // Unlike: Remove user from likedBy array
      await Project.findByIdAndUpdate(
        projectId,
        {
          $pull: { likedBy: authResult.userId },
          $inc: { likeCount: -1 }
        }
      )

      return NextResponse.json({ 
        message: 'Project unliked',
        isLiked: false,
        likeCount: Math.max(0, (project.likeCount || 0) - 1)
      })
    } else {
      // Like: Add user to likedBy array
      await Project.findByIdAndUpdate(
        projectId,
        {
          $addToSet: { likedBy: authResult.userId },
          $inc: { likeCount: 1 }
        }
      )

      return NextResponse.json({ 
        message: 'Project liked',
        isLiked: true,
        likeCount: (project.likeCount || 0) + 1
      })
    }
  } catch (error) {
    console.error('Error liking/unliking project:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    await dbConnect()

    const project = await Project.findById(projectId).select('likeCount likedBy')
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const isLiked = project.likedBy?.includes(authResult.userId) || false

    return NextResponse.json({
      likeCount: project.likeCount || 0,
      isLiked
    })
  } catch (error) {
    console.error('Error getting like status:', error)
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    )
  }
}