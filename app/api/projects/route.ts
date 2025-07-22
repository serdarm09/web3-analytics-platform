import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')
    const page = parseInt(searchParams.get('page') || '1')

    await dbConnect()

    const query: any = {}
    
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

    const projects = await Project.find(query)
      .sort({ marketCap: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Ensure all projects have required marketData and metrics
    const processedProjects = projects.map(project => ({
      ...project,
      marketData: {
        price: 0,
        marketCap: 0,
        volume24h: 0,
        change24h: 0,
        change7d: 0,
        circulatingSupply: 0,
        totalSupply: 0,
        ...project.marketData
      },
      metrics: {
        socialScore: 0,
        trendingScore: 0,
        hypeScore: 0,
        holders: 0,
        ...project.metrics
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      symbol, 
      logo,
      description, 
      category, 
      website, 
      whitepaper,
      socialLinks 
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
      logo: logo || 'https://via.placeholder.com/150',
      description,
      category,
      website,
      whitepaper,
      socialLinks,
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
        socialScore: 0,
        trendingScore: 0,
        hypeScore: 0,
        holders: 0,
        transactions24h: 0,
        activeAddresses24h: 0,
        tvl: 0
      },
      lastUpdated: new Date()
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}