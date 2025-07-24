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

    // Find trending projects based on views and additions
    const projects = await Project.find({
      $or: [
        { lastViewed: { $gte: dateFilter } },
        { lastAdded: { $gte: dateFilter } }
      ]
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
      'marketData.price': 1,
      'marketData.marketCap': 1,
      'marketData.change24h': 1,
      'marketData.volume24h': 1,
      lastUpdated: 1
    })
    .sort({ 
      viewCount: -1,
      addCount: -1 
    })
    .limit(20)
    .lean()

    // Calculate trending scores and format response
    const trendingProjects = projects.map(project => {
      const totalViews = project.viewCount || 0
      const totalAdds = project.addCount || 0
      const recentActivity = totalViews + (totalAdds * 2) // Weight additions more
      
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
        marketCap: project.marketData?.marketCap,
        price: project.marketData?.price,
        priceChange24h: project.marketData?.change24h,
        volume24h: project.marketData?.volume24h,
        lastUpdated: project.lastUpdated,
        recentActivity
      }
    }).sort((a, b) => b.recentActivity - a.recentActivity)

    // Get additional market data if needed
    const projectsWithMarketData = await Promise.all(
      trendingProjects.map(async (project) => {
        // You can fetch additional market data here if needed
        return {
          ...project,
          trendingScore: project.recentActivity || 0,
          stats: {
            views: project.totalViews,
            adds: project.totalAdds,
            engagement: ((project.totalViews + project.totalAdds * 2) / 3).toFixed(1)
          }
        }
      })
    )

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