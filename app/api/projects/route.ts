import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import { verifyAuth } from '@/lib/auth/middleware'
import { rateLimitPresets } from '@/lib/middleware/rateLimiter'

export async function GET(request: NextRequest) {
  return rateLimitPresets.read(request, async (req) => {
  try {
    // Authenticate user to get tracked projects
    const authResult = await verifyAuth(req)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')
    const publicOnly = searchParams.get('public') === 'true'

    await dbConnect()

    let query: any = {}
    
    if (publicOnly) {
      // Fetch public projects
      query.isPublic = true
    } else {
      // Get user's tracked projects
      const User = (await import('@/models/User')).default
      const user = await User.findById(authResult.userId).select('trackedProjects')
      
      if (!user || !user.trackedProjects || user.trackedProjects.length === 0) {
        // Return empty result if user has no tracked projects
        return NextResponse.json({
          projects: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0
          }
        })
      }

      query._id = { $in: user.trackedProjects }
    }
    
    if (category && category !== 'All') {
      query.category = category
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    // Determine sort order based on sort parameter
    let sortQuery: any = { marketCap: -1 } // default sort
    if (sort === 'trending') {
      sortQuery = { views: -1, watchlistCount: -1 }
    }

    const projects = await Project.find(query)
      .populate('addedBy', 'email name username')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()

    // Ensure all projects have required marketData and metrics
    const processedProjects = projects.map(project => ({
      ...project,
      id: project._id?.toString() || '',
      marketData: {
        ...(project.marketData || {}),
        price: project.marketData?.price ?? 0,
        marketCap: project.marketData?.marketCap ?? 0,
        volume24h: project.marketData?.volume24h ?? 0,
        change24h: project.marketData?.change24h ?? 0,
        change7d: project.marketData?.change7d ?? 0,
        circulatingSupply: project.marketData?.circulatingSupply ?? 0,
        totalSupply: project.marketData?.totalSupply ?? 0
      },
      metrics: {
        ...(project.metrics || {}),
        socialScore: project.metrics?.socialScore ?? 0,
        trendingScore: project.metrics?.trendingScore ?? 0,
        hypeScore: project.metrics?.hypeScore ?? 0,
        holders: project.metrics?.holders ?? 0
      }
    }))

    const total = await Project.countDocuments(query)

    return NextResponse.json({
      projects: processedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
  })
}

export async function POST(request: NextRequest) {
  return rateLimitPresets.write(request, async (req) => {
  try {
    // Verify authentication
    const auth = await verifyAuth(req)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json()
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
      partnerships
    } = body

    if (!name || !symbol || !category) {
      return NextResponse.json(
        { error: 'Name, symbol and category are required' },
        { status: 400 }
      )
    }

    await dbConnect()

    const existingProject = await Project.findOne({ 
      $or: [{ symbol }, { name }] 
    })
    
    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this name or symbol already exists' },
        { status: 400 }
      )
    }

    const project = await Project.create({
      name,
      symbol,
      logo: logo || `https://ui-avatars.com/api/?name=${symbol}&background=64748b&color=fff`,
      description,
      category,
      blockchain: blockchain || 'Unknown',
      contractAddress: contractAddress || '',
      isTestnet: isTestnet || false,
      isPublic: isPublic ?? false,
      website,
      whitepaper,
      socialLinks,
      launchDate,
      tokenomics,
      team,
      audits,
      partnerships,
      views: 0,
      watchlistCount: 0,
      addedBy: auth.userId!, // Now using authenticated user's ID
      addedAt: new Date(),
      marketData: {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        change24h: 0,
        change7d: 0,
        change30d: 0,
        circulatingSupply: 0,
        totalSupply: 0,
        maxSupply: 0,
        ath: 0,
        athDate: new Date(),
        atl: 0,
        atlDate: new Date(),
        marketCapRank: 0
      },
      metrics: {
        starRating: 0,
        holders: 0,
        transactions24h: 0,
        activeAddresses24h: 0,
        tvl: 0
      },
      lastUpdated: new Date()
    })

    // Add project to user's tracked projects
    const User = (await import('@/models/User')).default
    await User.findByIdAndUpdate(
      auth.userId,
      { $addToSet: { trackedProjects: project._id } }
    )

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
  })
}