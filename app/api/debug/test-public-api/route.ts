import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get cookies to simulate browser request
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    
    // Get base URL dynamically
    const baseUrl = request.headers.get('host') 
      ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`
      : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Test 1: Without credentials
    const response1 = await fetch(`${baseUrl}/api/projects?public=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    const data1 = await response1.json()
    
    // Test 2: With token cookie if exists
    const headers: any = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Cookie'] = `token=${token.value}`
    }
    
    const response2 = await fetch(`${baseUrl}/api/projects?public=true`, {
      method: 'GET',
      headers
    })
    const data2 = await response2.json()
    
    return NextResponse.json({
      hasToken: !!token,
      test1: {
        status: response1.status,
        projectCount: data1.projects?.length || 0,
        error: data1.error
      },
      test2: {
        status: response2.status,
        projectCount: data2.projects?.length || 0,
        error: data2.error
      },
      conclusion: 'Both tests should return public projects'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}