import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}/search/trending`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching trending data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending data' },
      { status: 500 }
    )
  }
}