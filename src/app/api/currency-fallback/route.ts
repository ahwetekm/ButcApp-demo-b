import { NextRequest, NextResponse } from 'next/server'

// Fallback currency data when TCMB is unavailable
const fallbackCurrencyData = [
  { symbol: 'USD/TRY', name: 'ABD DOLARI', price: 34.6039, change: 0.1234, changePercent: 0.36, forexBuying: 34.5500, forexSelling: 34.6578 },
  { symbol: 'EUR/TRY', name: 'EURO', price: 36.1234, change: -0.2345, changePercent: -0.64, forexBuying: 36.0800, forexSelling: 36.1668 },
  { symbol: 'GBP/TRY', name: 'İNGİLİZ STERLİNİ', price: 43.7890, change: 0.4567, changePercent: 1.05, forexBuying: 43.7200, forexSelling: 43.8580 },
  { symbol: 'CHF/TRY', name: 'İSVİÇRE FRANGI', price: 39.8765, change: -0.1234, changePercent: -0.31, forexBuying: 39.8400, forexSelling: 39.9130 },
  { symbol: 'SEK/TRY', name: 'İSVEÇ KRONU', price: 3.1234, change: 0.0123, changePercent: 0.39, forexBuying: 3.1100, forexSelling: 3.1368 },
  { symbol: 'DKK/TRY', name: 'DANİMARKA KRONU', price: 4.8765, change: -0.0345, changePercent: -0.70, forexBuying: 4.8600, forexSelling: 4.8930 },
  { symbol: 'NOK/TRY', name: 'NORVEÇ KRONU', price: 3.2345, change: 0.0456, changePercent: 1.43, forexBuying: 3.2200, forexSelling: 3.2490 },
  { symbol: 'CAD/TRY', name: 'KANADA DOLARI', price: 25.4567, change: 0.2345, changePercent: 0.93, forexBuying: 25.4200, forexSelling: 25.4934 },
  { symbol: 'AUD/TRY', name: 'AVUSTRALYA DOLARI', price: 22.3456, change: -0.1234, changePercent: -0.55, forexBuying: 22.3200, forexSelling: 22.3712 },
  { symbol: 'JPY/TRY', name: 'JAPON YENİ', price: 0.2345, change: 0.0012, changePercent: 0.51, forexBuying: 0.2340, forexSelling: 0.2350 }
]

export async function GET() {
  try {
    console.log('Using fallback currency data due to TCMB connectivity issues')
    
    return NextResponse.json({
      success: true,
      data: fallbackCurrencyData,
      timestamp: new Date().toISOString(),
      cached: false,
      fallback: true,
      message: 'Using fallback data due to TCMB connectivity issues'
    })
    
  } catch (error) {
    console.error('Currency API fallback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch currency data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}