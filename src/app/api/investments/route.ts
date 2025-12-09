import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authentication middleware
async function authenticate(request: NextRequest) {
  try {
    console.log('🔐 Starting authentication process')
    
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '') ||
                  request.nextUrl.searchParams.get('token')
    
    console.log('Token found:', !!token)
    
    if (!token) {
      console.log('❌ No token provided')
      return { error: 'Unauthorized', status: 401 }
    }

    console.log('🔍 Verifying token...')
    const user = await AuthService.verifyToken(token)
    
    if (!user) {
      console.log('❌ Invalid token')
      return { error: 'Unauthorized', status: 401 }
    }

    console.log('✅ Authentication successful for:', user.email)
    return { user, token }
  } catch (error) {
    console.error('❌ Authentication error:', error)
    return { error: 'Authentication failed', status: 500 }
  }
}

// GET - Fetch investments
export async function GET(request: NextRequest) {
  try {
    console.log('=== INVESTMENTS API START ===')
    console.log('Request URL:', request.url)
    console.log('Request method:', request.method)
    
    // Check if this is a public request for currency/crypto data only
    const { searchParams } = new URL(request.url)
    const publicRequest = searchParams.get('public') === 'true'
    
    if (publicRequest) {
      console.log('🌐 Public request - returning currency/crypto data only')
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'Public request - no investment data without authentication'
      })
    }
    
    // For authenticated requests, proceed with normal flow
    const auth = await authenticate(request)
    if (auth.error) {
      console.log('❌ Authentication failed:', auth.error)
      // Return empty investments instead of error for better UX
      return NextResponse.json({ 
        success: true, 
        data: [],
        count: 0,
        message: 'Authentication required to view investments'
      }, { status: 200 }) // Return 200 instead of 401
    }

    const userId = searchParams.get('userId') || auth.user.id

    console.log('✅ Authentication successful for user:', auth.user.email)
    console.log('📊 Fetching investments for userId:', userId)

    // Fetch investments from database
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('userid', userId)
      .order('createdat', { ascending: false })

    if (error) {
      console.error('❌ Investment fetch error:', error)
      return NextResponse.json({ 
        success: true, // Return success even on error
        data: [],
        count: 0,
        error: 'Failed to fetch investments',
        details: error.message 
      }, { status: 200 }) // Return 200 instead of 500
    }

    console.log('✅ Investments fetched successfully:', investments?.length || 0, 'items')

    // Transform data to match frontend interface
    const transformedInvestments = (investments || []).map(inv => ({
      id: inv.id,
      userId: inv.userid,
      type: inv.type, // Use type directly
      symbol: inv.symbol || '',
      name: inv.name,
      amount: inv.amount,
      buyPrice: inv.buyprice, // Map from Supabase field
      currentPrice: inv.currentprice, // Map from Supabase field
      currency: inv.symbol?.split('/')[0] || 'USD',
      buyDate: inv.buydate ? new Date(inv.buydate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: inv.notes,
      createdAt: inv.createdat, // Map from Supabase field
      updatedAt: inv.updatedat // Map from Supabase field
    }))

    console.log('✅ Investments transformed successfully')
    console.log('=== INVESTMENTS API END ===')

    return NextResponse.json({
      success: true,
      data: transformedInvestments,
      count: transformedInvestments.length
    })

  } catch (error) {
    console.error('❌ Investment API error:', error)
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    
    // Return success even on error to prevent frontend crashes
    return NextResponse.json({ 
      success: true,
      data: [],
      count: 0,
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 200 }) // Return 200 instead of 500
  }
}

// POST - Create new investment
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const userId = auth.user.id

    // Validate required fields
    if (!body.name || !body.amount || !body.buyPrice) {
      return NextResponse.json({ 
        success: false,
        error: 'Name, amount, and buy price are required' 
      }, { status: 400 })
    }

    // Create investment
    const investment = {
      id: `investment_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userid: userId,
      type: body.type || 'currency', // Use type directly, not investmenttype
      name: body.name.trim(),
      notes: body.notes?.trim() || '',
      amount: parseFloat(body.amount),
      symbol: body.symbol || '',
      buyprice: parseFloat(body.buyPrice), // Use buyprice for Supabase
      currentprice: parseFloat(body.currentPrice) || parseFloat(body.buyPrice), // Use currentprice for Supabase
      buydate: body.buyDate || new Date().toISOString(), // Use buydate for Supabase
      createdat: new Date().toISOString(), // Use createdat for Supabase
      updatedat: new Date().toISOString() // Use updatedat for Supabase
    }

    const { data: newInvestment, error } = await supabase
      .from('investments')
      .insert([investment])
      .select()
      .single()

    if (error) {
      console.error('Investment creation error:', error)
      return NextResponse.json({ 
        success: false,
        error: 'Failed to create investment' 
      }, { status: 500 })
    }

    // Transform response to match frontend interface
    const transformedInvestment = {
      id: newInvestment.id,
      userId: newInvestment.userid,
      type: newInvestment.type, // Use type directly
      symbol: newInvestment.symbol || '',
      name: newInvestment.name,
      amount: newInvestment.amount,
      buyPrice: newInvestment.buyprice, // Map from Supabase field
      currentPrice: newInvestment.currentprice, // Map from Supabase field
      currency: newInvestment.symbol?.split('/')[0] || 'USD',
      buyDate: newInvestment.buydate ? new Date(newInvestment.buydate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: newInvestment.notes,
      createdAt: newInvestment.createdat, // Map from Supabase field
      updatedAt: newInvestment.updatedat // Map from Supabase field
    }

    return NextResponse.json({ 
      success: true,
      message: 'Investment created successfully',
      data: transformedInvestment 
    }, { status: 201 })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 })
  }
}