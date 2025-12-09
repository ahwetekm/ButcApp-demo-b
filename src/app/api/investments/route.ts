import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth-service'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Authentication middleware
async function authenticate(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.nextUrl.searchParams.get('token')
  
  if (!token) {
    return { error: 'Unauthorized', status: 401 }
  }

  const user = await AuthService.verifyToken(token)
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  return { user, token }
}

// GET - Fetch investments
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || auth.user.id

    // Fetch investments from database
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('userid', userId)
      .eq('type', 'investment')
      .order('createdat', { ascending: false })

    if (error) {
      console.error('Investment fetch error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch investments' 
      }, { status: 500 })
    }

    // Transform data to match frontend interface
    const transformedInvestments = (investments || []).map(inv => ({
      id: inv.id,
      userId: inv.userid,
      type: inv.investmenttype,
      symbol: inv.symbol || '',
      name: inv.name,
      amount: inv.amount,
      buyPrice: inv.purchaseprice || inv.amount,
      currentPrice: inv.currentprice || inv.amount,
      currency: inv.category || 'USD',
      buyDate: inv.purchasedate ? new Date(inv.purchasedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: inv.description,
      createdAt: inv.createdat,
      updatedAt: inv.updatedat,
      quantity: inv.quantity,
      category: inv.category
    }))

    return NextResponse.json({
      success: true,
      data: transformedInvestments,
      count: transformedInvestments.length
    })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
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
      type: 'investment',
      name: body.name.trim(),
      description: body.notes?.trim() || '',
      amount: parseFloat(body.amount),
      investmenttype: body.type || 'stock',
      category: body.currency || 'USD',
      symbol: body.symbol || '',
      quantity: body.quantity ? parseFloat(body.quantity) : null,
      purchaseprice: parseFloat(body.buyPrice),
      currentprice: parseFloat(body.currentPrice) || parseFloat(body.buyPrice),
      purchasedate: body.buyDate || new Date().toISOString(),
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString()
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
      type: newInvestment.investmenttype,
      symbol: newInvestment.symbol || '',
      name: newInvestment.name,
      amount: newInvestment.amount,
      buyPrice: newInvestment.purchaseprice,
      currentPrice: newInvestment.currentprice,
      currency: newInvestment.category || 'USD',
      buyDate: newInvestment.purchasedate ? new Date(newInvestment.purchasedate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: newInvestment.description,
      createdAt: newInvestment.createdat,
      updatedAt: newInvestment.updatedat,
      quantity: newInvestment.quantity,
      category: newInvestment.category
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