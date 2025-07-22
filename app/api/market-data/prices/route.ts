import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')
    const vsCurrencies = searchParams.get('vs_currencies') || 'usd'
    const includeMarketCap = searchParams.get('include_market_cap') || 'true'
    const include24hrVol = searchParams.get('include_24hr_vol') || 'true'
    const include24hrChange = searchParams.get('include_24hr_change') || 'true'

    if (!ids) {
      return NextResponse.json(
        { error: 'IDs parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${COINGECKO_API_URL}/simple/price?ids=${ids}&vs_currencies=${vsCurrencies}&include_market_cap=${includeMarketCap}&include_24hr_vol=${include24hrVol}&include_24hr_change=${include24hrChange}`,
      {
        headers: {
          'Accept': 'application/json',
          ...(process.env.COINGECKO_API_KEY && {
            'x-cg-demo-api-key': process.env.COINGECKO_API_KEY
          })
        },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching crypto prices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crypto prices' },
      { status: 500 }
    )
  }
}
