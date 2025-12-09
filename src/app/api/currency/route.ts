import { NextRequest, NextResponse } from 'next/server'

// Mock currency data - In production, this would fetch from TCMB or a real API
const mockCurrencyData = [
  {
    symbol: 'USD/TRY',
    name: 'Amerikan Doları',
    price: 32.4500,
    change: 0.1250,
    changePercent: 0.39,
    forexBuying: 32.4250,
    forexSelling: 32.4750
  },
  {
    symbol: 'EUR/TRY',
    name: 'Euro',
    price: 35.2800,
    change: 0.1800,
    changePercent: 0.51,
    forexBuying: 35.2500,
    forexSelling: 35.3100
  },
  {
    symbol: 'GBP/TRY',
    name: 'İngiliz Sterlini',
    price: 41.3500,
    change: 0.2200,
    changePercent: 0.54,
    forexBuying: 41.3000,
    forexSelling: 41.4000
  },
  {
    symbol: 'CHF/TRY',
    name: 'İsviçre Frangı',
    price: 37.8900,
    change: 0.1500,
    changePercent: 0.40,
    forexBuying: 37.8500,
    forexSelling: 37.9300
  },
  {
    symbol: 'JPY/TRY',
    name: 'Japon Yeni',
    price: 0.2185,
    change: 0.0008,
    changePercent: 0.37,
    forexBuying: 0.2182,
    forexSelling: 0.2188
  },
  {
    symbol: 'SAR/TRY',
    name: 'Suudi Arabistan Riyali',
    price: 8.6530,
    change: 0.0320,
    changePercent: 0.37,
    forexBuying: 8.6480,
    forexSelling: 8.6580
  },
  {
    symbol: 'AED/TRY',
    name: 'BAE Dirhemi',
    price: 8.8350,
    change: 0.0315,
    changePercent: 0.36,
    forexBuying: 8.8300,
    forexSelling: 8.8400
  },
  {
    symbol: 'CAD/TRY',
    name: 'Kanada Doları',
    price: 23.8900,
    change: 0.0950,
    changePercent: 0.40,
    forexBuying: 23.8600,
    forexSelling: 23.9200
  },
  {
    symbol: 'AUD/TRY',
    name: 'Avustralya Doları',
    price: 21.4500,
    change: 0.0880,
    changePercent: 0.41,
    forexBuying: 21.4200,
    forexSelling: 21.4800
  },
  {
    symbol: 'RUB/TRY',
    name: 'Rus Rublesi',
    price: 0.3580,
    change: 0.0015,
    changePercent: 0.42,
    forexBuying: 0.3575,
    forexSelling: 0.3585
  },
  {
    symbol: 'CNY/TRY',
    name: 'Çin Yuanı',
    price: 4.4850,
    change: 0.0180,
    changePercent: 0.40,
    forexBuying: 4.4800,
    forexSelling: 4.4900
  },
  {
    symbol: 'NOK/TRY',
    name: 'Norveç Kronu',
    price: 3.0250,
    change: 0.0120,
    changePercent: 0.40,
    forexBuying: 3.0200,
    forexSelling: 3.0300
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('=== CURRENCY API START ===')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150))
    
    console.log('✅ Currency data fetched successfully:', mockCurrencyData.length, 'items')
    console.log('=== CURRENCY API END ===')

    return NextResponse.json({
      success: true,
      data: mockCurrencyData,
      cached: false,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Currency API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch currency data',
      details: (error as Error).message
    }, { status: 500 })
  }
}