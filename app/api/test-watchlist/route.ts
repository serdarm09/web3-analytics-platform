import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test fetching public projects without any authentication
    const response = await fetch('http://localhost:3000/api/projects?public=true', {
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