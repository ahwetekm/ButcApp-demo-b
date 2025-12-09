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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'createdat'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('investments')
      .select('*', { count: 'exact' })
      .eq('userid', auth.user.id)
      .eq('type', 'investment')

    // Apply filters
    if (type) {
      query = query.eq('investmenttype', type)
    }
    if (category) {
      query = query.eq('category', category)
    }

    // Apply sorting
    const validSortFields = ['createdat', 'updatedat', 'amount', 'name', 'investmenttype']
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdat'
    query = query.order(sortField, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: investments, error, count } = await query

    if (error) {
      console.error('Investment fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch investments' }, { status: 500 })
    }

    // Calculate totals
    const { data: totals, error: totalsError } = await supabase
      .from('investments')
      .select('amount')
      .eq('userid', auth.user.id)
      .eq('type', 'investment')

    let totalInvested = 0
    let totalCurrentValue = 0

    if (!totalsError && totals) {
      totalInvested = totals.reduce((sum, inv) => sum + inv.amount, 0)
      // For current value, we'll use the invested amount for now
      // In a real app, this would be calculated based on current market prices
      totalCurrentValue = totalInvested
    }

    return NextResponse.json({
      investments: investments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      totals: {
        totalInvested,
        totalCurrentValue,
        totalGain: totalCurrentValue - totalInvested
      }
    })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    if (!body.name || !body.amount || !body.investmentType) {
      return NextResponse.json({ 
        error: 'Name, amount, and investment type are required' 
      }, { status: 400 })
    }

    // Validate amount
    const amount = parseFloat(body.amount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ 
        error: 'Amount must be a positive number' 
      }, { status: 400 })
    }

    // Validate investment type
    const validInvestmentTypes = ['stock', 'bond', 'crypto', 'fund', 'real_estate', 'commodity', 'other']
    if (!validInvestmentTypes.includes(body.investmentType)) {
      return NextResponse.json({ 
        error: 'Invalid investment type' 
      }, { status: 400 })
    }

    // Create investment
    const investment = {
      id: `investment_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userid: userId,
      type: 'investment',
      name: body.name.trim(),
      description: body.description?.trim() || '',
      amount: amount,
      investmenttype: body.investmentType,
      category: body.category?.trim() || '',
      symbol: body.symbol?.trim() || '',
      quantity: body.quantity ? parseFloat(body.quantity) : null,
      purchaseprice: body.purchasePrice ? parseFloat(body.purchasePrice) : amount,
      currentprice: body.currentPrice ? parseFloat(body.currentPrice) : amount,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate).toISOString() : new Date().toISOString(),
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
      return NextResponse.json({ error: 'Failed to create investment' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Investment created successfully',
      investment: newInvestment 
    }, { status: 201 })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update investment
export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()
    const userId = auth.user.id

    if (!body.id) {
      return NextResponse.json({ error: 'Investment ID is required' }, { status: 400 })
    }

    // Check if investment exists and belongs to user
    const { data: existingInvestment, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', body.id)
      .eq('userid', userId)
      .eq('type', 'investment')
      .single()

    if (fetchError || !existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      updatedat: new Date().toISOString()
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'amount', 'investmenttype', 'category', 'symbol', 'quantity', 'purchaseprice', 'currentprice', 'purchaseDate']
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'amount' || field === 'quantity' || field === 'purchaseprice' || field === 'currentprice') {
          updateData[field] = parseFloat(body[field])
          if (isNaN(updateData[field])) {
            return NextResponse.json({ error: `${field} must be a valid number` }, { status: 400 })
          }
        } else if (field === 'purchaseDate') {
          updateData[field] = new Date(body[field]).toISOString()
        } else {
          updateData[field] = body[field].trim()
        }
      }
    }

    // Validate investment type if provided
    if (updateData.investmenttype) {
      const validInvestmentTypes = ['stock', 'bond', 'crypto', 'fund', 'real_estate', 'commodity', 'other']
      if (!validInvestmentTypes.includes(updateData.investmenttype)) {
        return NextResponse.json({ error: 'Invalid investment type' }, { status: 400 })
      }
    }

    const { data: updatedInvestment, error: updateError } = await supabase
      .from('investments')
      .update(updateData)
      .eq('id', body.id)
      .eq('userid', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Investment update error:', updateError)
      return NextResponse.json({ error: 'Failed to update investment' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Investment updated successfully',
      investment: updatedInvestment 
    })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete investment
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticate(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const investmentId = searchParams.get('id')

    if (!investmentId) {
      return NextResponse.json({ error: 'Investment ID is required' }, { status: 400 })
    }

    // Check if investment exists and belongs to user
    const { data: existingInvestment, error: fetchError } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .eq('userid', auth.user.id)
      .eq('type', 'investment')
      .single()

    if (fetchError || !existingInvestment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Delete investment
    const { error: deleteError } = await supabase
      .from('investments')
      .delete()
      .eq('id', investmentId)
      .eq('userid', auth.user.id)

    if (deleteError) {
      console.error('Investment deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete investment' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Investment deleted successfully' 
    })

  } catch (error) {
    console.error('Investment API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}