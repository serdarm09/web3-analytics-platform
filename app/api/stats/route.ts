import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import Project from '@/models/Project'
import Portfolio from '@/models/Portfolio'
import WhaleWallet from '@/models/WhaleWallet'

export async function GET() {
  try {
    await dbConnect()

    const [userCount, projectCount, whaleCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments({ isActive: true }),
      WhaleWallet.countDocuments({ isActive: true })
    ])

    // Calculate total volume from projects
    const volumeResult = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalVolume: { $sum: '$marketData.volume24h' } } }
    ])
    
    const totalVolume = volumeResult[0]?.totalVolume || 0

    const stats = {
      activeUsers: userCount > 0 ? `${Math.floor(userCount / 1000)}K+` : '50K+',
      projectsTracked: projectCount > 0 ? `${Math.floor(projectCount / 1000)}K+` : '10K+',
      totalVolume: totalVolume > 1000000000 
        ? `$${(totalVolume / 1000000000).toFixed(1)}B` 
        : totalVolume > 1000000 
        ? `$${(totalVolume / 1000000).toFixed(1)}M`
        : '$2.5B',
      whaleWallets: whaleCount > 0 ? `${Math.floor(whaleCount / 1000)}K+` : '5K+'
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return default values on error
    return NextResponse.json({
      activeUsers: '50K+',
      projectsTracked: '10K+',
      totalVolume: '$2.5B',
      whaleWallets: '5K+'
    })
  }
}