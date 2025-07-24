import { NextRequest, NextResponse } from 'next/server'

// CoinGecko API proxy endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const endpoint = searchParams.get('endpoint')
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint parameter is required' },
        { status: 400 }
      )
    }

    // Build the CoinGecko API URL
    const baseUrl = 'https://api.coingecko.com/api/v3'
    const url = new URL(`${baseUrl}/${endpoint}`)
    
    // Copy all other search params to the CoinGecko request
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        url.searchParams.append(key, value)
      }
    })

    // Make the request to CoinGecko
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Cache the response for 60 seconds
      next: { revalidate: 60 }
    })

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: `CoinGecko API error: ${response.status} - ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Return the response with proper CORS headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      }
    })
    
  } catch (error) {
    console.error('CoinGecko proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data from CoinGecko' },
      { status: 500 }
    )
  }
}