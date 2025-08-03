import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import Project from '@/models/Project'
import { fetchMarketData, getMockMarketData } from '@/lib/services/simpleMarketService'

export async function GET(request: NextRequest) {
  try {
    // Simple API key check for cron job security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'development-cron-secret'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await dbConnect()

    // Get all active projects
    const projects = await Project.find({ isActive: true })
      .select('symbol marketData')
      .limit(100) // Limit to avoid rate limits

    if (projects.length === 0) {
      return NextResponse.json({
        message: 'No active projects to update',
        updated: 0
      })
    }

    // Get unique symbols
    const symbols = [...new Set(projects.map(p => p.symbol))]
    
    // Fetch market data
    const marketDataMap = await fetchMarketData(symbols)

    // Update projects
    let updatedCount = 0
    const updatePromises = []

    for (const project of projects) {
      const marketData = marketDataMap.get(project.symbol)
      
      if (marketData) {
        // Real data from API
        updatePromises.push(
          Project.findByIdAndUpdate(project._id, {
            'marketData.price': marketData.price,
            'marketData.marketCap': marketData.marketCap,
            'marketData.volume24h': marketData.volume24h,
            'marketData.change24h': marketData.change24h,
            'marketData.change7d': marketData.change7d,
            'marketData.circulatingSupply': marketData.circulatingSupply,
            'marketData.totalSupply': marketData.totalSupply,
            lastUpdated: new Date()
          })
        )
        updatedCount++
      } else if (process.env.NODE_ENV === 'development') {
        // Use mock data in development if API fails
        const mockData = getMockMarketData(project.symbol)
        updatePromises.push(
          Project.findByIdAndUpdate(project._id, {
            'marketData.price': mockData.price,
            'marketData.marketCap': mockData.marketCap,
            'marketData.volume24h': mockData.volume24h,
            'marketData.change24h': mockData.change24h,
            'marketData.change7d': mockData.change7d,
            'marketData.circulatingSupply': mockData.circulatingSupply,
            'marketData.totalSupply': mockData.totalSupply,
            lastUpdated: new Date()
          })
        )
        updatedCount++
      }
    }

    // Execute all updates
    await Promise.all(updatePromises)

    // Calculate and update metrics for trending
    await updateTrendingScores()

    return NextResponse.json({
      message: 'Market data updated successfully',
      updated: updatedCount,
      total: projects.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market data update error:', error)
    return NextResponse.json(
      { error: 'Failed to update market data' },
      { status: 500 }
    )
  }
}

async function updateTrendingScores() {
  try {
    const projects = await Project.find({ isActive: true })

    for (const project of projects) {
      const { marketData } = project
      
      // Calculate trending score based on volume and price change
      const volumeScore = marketData.marketCap > 0 
        ? Math.min(40, (marketData.volume24h / marketData.marketCap) * 100)
        : 0
      const changeScore = Math.min(30, Math.abs(marketData.change24h))
      const viewScore = Math.min(30, project.views / 100)
      
      project.metrics.trendingScore = Math.round(volumeScore + changeScore + viewScore)
      
      // Update hype score
      const change7dScore = Math.min(40, Math.abs(marketData.change7d || 0))
      const watchlistScore = Math.min(30, project.watchlistCount / 10)
      const volumeHype = Math.min(30, volumeScore * 0.75)
      
      project.metrics.hypeScore = Math.round(change7dScore + watchlistScore + volumeHype)
      
      // Simple social score (would need real social data)
      project.metrics.socialScore = Math.min(100, 
        project.watchlistCount * 2 + 
        project.views / 50 + 
        Math.random() * 20
      )
      
      await project.save()
    }
  } catch (error) {
    console.error('Error updating trending scores:', error)
  }
}
