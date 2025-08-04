import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/database/mongoose'
import InviteCode from '@/models/InviteCode'

export async function GET() {
  try {
    await dbConnect()

    // Get all invite codes with their exact data
    const allCodes = await InviteCode.find({}).populate('createdBy', 'name username')
    
    return NextResponse.json({
      message: 'All invite codes in database',
      count: allCodes.length,
      codes: allCodes.map(code => ({
        _id: code._id,
        code: code.code,
        originalCode: JSON.stringify(code.code), // Show exact string representation
        usageCount: code.usageCount,
        usageLimit: code.usageLimit,
        expiresAt: code.expiresAt,
        createdBy: (code.createdBy as any)?.name || (code.createdBy as any)?.username || 'Unknown',
        isExpired: code.expiresAt && code.expiresAt < new Date(),
        hasReachedLimit: code.usageCount >= code.usageLimit
      }))
    })

  } catch (error: any) {
    console.error('Error fetching codes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch codes', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { testCode } = await request.json()
    
    await dbConnect()

    // Test exact search for the code
    console.log('Testing search for code:', testCode)
    console.log('Uppercase version:', testCode?.toUpperCase())
    
    // Try different search approaches
    const exactSearch = await InviteCode.findOne({ code: testCode })
    const upperSearch = await InviteCode.findOne({ code: testCode?.toUpperCase() })
    const regexSearch = await InviteCode.findOne({ code: new RegExp(`^${testCode}$`, 'i') })
    
    return NextResponse.json({
      testCode,
      testCodeUpper: testCode?.toUpperCase(),
      searches: {
        exact: exactSearch ? { found: true, code: exactSearch.code } : { found: false },
        upper: upperSearch ? { found: true, code: upperSearch.code } : { found: false },
        regex: regexSearch ? { found: true, code: regexSearch.code } : { found: false }
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    )
  }
}
