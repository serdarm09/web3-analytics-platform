import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import { verifyAuth } from '@/lib/auth/middleware'
import Project from '@/models/Project'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { id: projectId } = await context.params

    // Update view count and last viewed timestamp
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $inc: { viewCount: 1 },
        $set: { lastViewed: new Date() },
        $addToSet: { viewedBy: authResult.userId }
      },
      { new: true }
    )

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking project view:', error)
    return NextResponse.json(
      { error: 'Failed to track project view' },
      { status: 500 }
    )
  }
}