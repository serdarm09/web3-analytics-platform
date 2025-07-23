import { NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import User from '@/models/User'
import Project from '@/models/Project'
import Portfolio from '@/models/Portfolio'
import TrackedWallet from '@/models/TrackedWallet'

export async function GET() {
  try {
    await dbConnect()

    const [userCount, projectCount, walletCount] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments({ isActive: true }),
      TrackedWallet.countDocuments({ isActive: true })
    ])

    // Calculate total volume from projects
    const volumeResult = await Project.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalVolume: { $sum: '$marketData.volume24h' } } }
    ])
    
    const totalVolume = volumeResult[0]?.totalVolume || 0

    const formatNumber = (num: number): string => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`
      if (num >= 1000) return `${Math.floor(num / 1000)}K+`
      return num.toString()
    }

    const formatVolume = (volume: number): string => {
      if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`
      if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
      if (volume >= 1000) return `$${Math.floor(volume / 1000)}K`
      return `$${volume.toFixed(0)}`
    }

    const stats = {
      activeUsers: formatNumber(userCount),
      projectsTracked: formatNumber(projectCount),
      totalVolume: formatVolume(totalVolume),
      walletTracker: formatNumber(walletCount)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Return zero values on error
    return NextResponse.json({
      activeUsers: '0',
      projectsTracked: '0',
      totalVolume: '$0',
      walletTracker: '0'
    })
  }
}