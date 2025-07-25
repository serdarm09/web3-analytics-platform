import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import { verifyAuth } from '@/lib/auth/middleware'
import Project from '@/models/Project'

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Get time period from query params (default: last 7 days)
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || '7d'
    
    let dateFilter = new Date()
    switch(period) {
      case '24h':
        dateFilter.setHours(dateFilter.getHours() - 24)
        break
      case '7d':
        dateFilter.setDate(dateFilter.getDate() - 7)
        break
      case '30d':
        dateFilter.setDate(dateFilter.getDate() - 30)
        break
      default:
        dateFilter.setDate(dateFilter.getDate() - 7)
    }

    // Find all public projects and calculate their trending scores
    const projects = await Project.find({
      isPublic: true
    })
    .select({
      name: 1,
      symbol: 1,
      description: 1,
      logo: 1,
      category: 1,
      blockchain: 1,
      website: 1,
      'socialLinks.twitter': 1,
      viewCount: 1,
      addCount: 1,
      likeCount: 1,
      'marketData.price': 1,
      'marketData.marketCap': 1,
      'marketData.change24h': 1,
      'marketData.volume24h': 1,
      'metrics.trendingScore': 1,
      lastUpdated: 1,
      addedBy: 1,
      addedAt: 1,
      isPublic: 1
    })
    .populate('addedBy', 'email name username')
    .lean()

    // Calculate trending scores and format response
    const trendingProjects = projects.map(project => {
      const totalViews = project.viewCount || 0
      const totalAdds = project.addCount || 0
      const totalLikes = project.likeCount || 0
      
      // Calculate trending score: views * 1 + adds * 2 + likes * 3
      const calculatedTrendingScore = (totalViews * 1) + (totalAdds * 2) + (totalLikes * 3)
      // Use the stored trending score if available, otherwise use calculated
      const trendingScore = project.metrics?.trendingScore || calculatedTrendingScore
      
      return {
        _id: project._id,
        name: project.name,
        symbol: project.symbol,
        description: project.description,
        logo: project.logo,
        category: project.category,
        blockchain: project.blockchain,
        website: project.website,
        twitter: project.socialLinks?.twitter,
        totalViews,
        totalAdds,
        likeCount: totalLikes,
        marketCap: project.marketData?.marketCap,
        price: project.marketData?.price,
        priceChange24h: project.marketData?.change24h,
        volume24h: project.marketData?.volume24h,
        lastUpdated: project.lastUpdated,
        trendingScore,
        creator: typeof project.addedBy === 'object' && project.addedBy ? {
          id: (project.addedBy as any)._id || project.addedBy,
          name: (project.addedBy as any).name || (project.addedBy as any).username || 'Anonymous',
          email: (project.addedBy as any).email
        } : null,
        addedAt: project.addedAt
      }
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 50) // Get top 50 projects

    // Format the response with stats
    const projectsWithMarketData = trendingProjects.map(project => ({
      ...project,
      stats: {
        views: project.totalViews,
        adds: project.totalAdds,
        likes: project.likeCount,
        engagement: ((project.totalViews + project.totalAdds * 2 + project.likeCount * 3) / 6).toFixed(1)
      }
    }))

    return NextResponse.json({
      success: true,
      period,
      projects: projectsWithMarketData
    })

  } catch (error) {
    console.error('Error fetching trending projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending projects' },
      { status: 500 }
    )
  }
}