import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') || '7'
    const vsCurrency = searchParams.get('vs_currency') || 'usd'
    const interval = searchParams.get('interval') || 'daily'
    
    if (!id) {
      return NextResponse.json(
        { error: 'Crypto ID is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${COINGECKO_API_URL}/coins/${id}/market_chart?vs_currency=${vsCurrency}&days=${days}&interval=${interval}`,
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
    console.error('Error fetching price history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    )
  }
}
