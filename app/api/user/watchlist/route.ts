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

    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Verify project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Add project to user's tracked projects if not already there
    const user = await User.findById(authResult.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.trackedProjects.includes(projectId)) {
      return NextResponse.json(
        { error: 'Project already in watchlist' },
        { status: 400 }
      )
    }

    user.trackedProjects.push(projectId)
    await user.save()

    // Also increment the project's add count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { addCount: 1 }
    })

    return NextResponse.json({
      success: true,
      message: 'Project added to watchlist successfully'
    })

  } catch (error) {
    console.error('Error adding to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add project to watchlist' },
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

    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    await dbConnect()

    // Remove project from user's tracked projects
    const user = await User.findById(authResult.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    user.trackedProjects = user.trackedProjects.filter(
      id => id.toString() !== projectId
    )
    await user.save()

    // Also decrement the project's add count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { addCount: -1 }
    })

    return NextResponse.json({
      success: true,
      message: 'Project removed from watchlist successfully'
    })

  } catch (error) {
    console.error('Error removing from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove project from watchlist' },
      { status: 500 }
    )
  }
}
