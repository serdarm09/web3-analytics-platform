import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    console.log('GET /api/projects/[projectId] - projectId:', projectId)
    
    const authResult = await verifyAuth(request)
    console.log('Auth result:', { authenticated: authResult.authenticated, userId: authResult.userId })
    
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const project = await Project.findById(projectId)
      .populate('addedBy', 'name username email')
      .lean()

    console.log('Found project:', { 
      id: project?._id, 
      name: project?.name, 
      found: !!project,
      isPublic: project?.isPublic,
      addedBy: project?.addedBy
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if project is public or owned by the user
    if (!project.isPublic && (project.addedBy as any)?._id?.toString() !== authResult.userId) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      project
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { projectId } = await params
    // Check if project exists and user is the creator
    const existingProject = await Project.findById(projectId)
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only the creator can edit the project
    if (existingProject.addedBy !== authResult.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to edit this project' },
        { status: 403 }
      )
    }

    const body = await request.json()
    console.log('Received update request:', {
      projectId: projectId,
      hasIsPublic: 'isPublic' in body,
      isPublic: body.isPublic
    })
    
    const {
      name,
      symbol,
      logo,
      description,
      category,
      blockchain,
      contractAddress,
      isTestnet,
      isPublic,
      website,
      whitepaper,
      socialLinks,
      launchDate,
      tokenomics,
      team,
      audits,
      partnerships,
      marketData,
      metrics
    } = body

    // Update only provided fields
    const updateData: any = {
      lastUpdated: new Date()
    }

    if (name !== undefined) updateData.name = name
    if (symbol !== undefined) updateData.symbol = symbol
    if (logo !== undefined) updateData.logo = logo
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (blockchain !== undefined) updateData.blockchain = blockchain
    if (contractAddress !== undefined) updateData.contractAddress = contractAddress
    if (isTestnet !== undefined) updateData.isTestnet = isTestnet
    if (isPublic !== undefined) updateData.isPublic = isPublic
    if (website !== undefined) updateData.website = website
    if (whitepaper !== undefined) updateData.whitepaper = whitepaper
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks
    if (launchDate !== undefined) updateData.launchDate = launchDate
    if (tokenomics !== undefined) updateData.tokenomics = tokenomics
    if (team !== undefined) updateData.team = team
    if (audits !== undefined) updateData.audits = audits
    if (partnerships !== undefined) updateData.partnerships = partnerships
    if (marketData !== undefined) updateData.marketData = { ...existingProject.marketData, ...marketData }
    if (metrics !== undefined) updateData.metrics = { ...existingProject.metrics, ...metrics }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const { projectId } = await params
    // Check if project exists and user is the creator
    const existingProject = await Project.findById(projectId)
    if (!existingProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Only the creator can delete the project
    if (existingProject.addedBy !== authResult.userId) {
      return NextResponse.json(
        { error: 'You are not authorized to delete this project' },
        { status: 403 }
      )
    }

    await Project.findByIdAndDelete(projectId)

    // Remove project from all users' tracked projects
    const User = (await import('@/models/User')).default
    await User.updateMany(
      { trackedProjects: projectId },
      { $pull: { trackedProjects: projectId } }
    )

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}