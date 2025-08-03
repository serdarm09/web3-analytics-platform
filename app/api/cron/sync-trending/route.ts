import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron
    const headersList = await headers()
    const authHeader = headersList.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the trending sync endpoint
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/trending`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to sync trending data: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Trending data synced successfully',
      result
    })
  } catch (error) {
    console.error('Error in cron sync-trending:', error)
    return NextResponse.json(
      { error: 'Failed to sync trending data' },
      { status: 500 }
    )
  }
}
