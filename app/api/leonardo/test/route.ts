import { NextResponse } from 'next/server'
import { createLeonardoClient } from '@/src/lib/leonardo'

export async function GET() {
  try {
    const client = createLeonardoClient()

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'LEONARDO_API_KEY not configured' },
        { status: 500 }
      )
    }

    const userInfo = await client.getUserInfo()

    return NextResponse.json({
      success: true,
      message: 'Leonardo.ai API connected successfully',
      user: userInfo.user,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
