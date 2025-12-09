import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase configuration
const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const headersList = request.headers
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
  const userAgent = headersList.get('user-agent') || 'unknown'
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'E-posta adresi gerekli'
      }, { status: 400 })
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({
        success: false,
        error: 'Geçersiz e-posta formatı'
      }, { status: 400 })
    }

    console.log('Checking email:', email.toLowerCase().trim())

    // Supabase'de kontrol et
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: 'Veritabanı hatası',
        details: error.message
      }, { status: 500 })
    }

    console.log('Email check result:', existingUser.length > 0 ? 'exists' : 'not found')

    return NextResponse.json({
      success: true,
      exists: existingUser.length > 0
    })

  } catch (error) {
    console.error('Email check error:', error)
    console.error('Error stack:', (error as Error).stack)
    
    return NextResponse.json({
      success: false,
      error: 'Bir hata oluştu',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  }
}