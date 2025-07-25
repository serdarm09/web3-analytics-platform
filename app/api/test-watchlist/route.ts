import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get base URL dynamically
    const baseUrl = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Test fetching public projects without any authentication
    const response = await fetch(`${baseUrl}/api/projects?public=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      projectCount: data.projects?.length || 0,
      projects: data.projects?.map((p: any) => ({
        name: p.name,
        symbol: p.symbol,
        isPublic: p.isPublic,
        addedBy: p.addedBy
      }))
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to test', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}