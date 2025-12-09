import { NextRequest, NextResponse } from 'next/server'

// Mock crypto data - In production, this would fetch from a real API
const mockCryptoData = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 43250.00,
    change: 1250.00,
    changePercent: 2.98,
    volume: '28.5B',
    marketCap: '845.2B',
    icon: '₿'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2280.50,
    change: 45.20,
    changePercent: 2.02,
    volume: '15.2B',
    marketCap: '273.8B',
    icon: 'Ξ'
  },
  {
    symbol: 'BNB',
    name: 'Binance Coin',
    price: 315.80,
    change: 8.40,
    changePercent: 2.73,
    volume: '1.2B',
    marketCap: '48.5B',
    icon: 'B'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 98.45,
    change: 3.25,
    changePercent: 3.41,
    volume: '2.8B',
    marketCap: '42.1B',
    icon: 'S'
  },
  {
    symbol: 'XRP',
    name: 'Ripple',
    price: 0.6250,
    change: 0.0150,
    changePercent: 2.46,
    volume: '1.5B',
    marketCap: '33.8B',
    icon: 'X'
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    price: 0.5850,
    change: 0.0120,
    changePercent: 2.09,
    volume: '425M',
    marketCap: '20.6B',
    icon: 'A'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.0850,
    change: 0.0025,
    changePercent: 3.03,
    volume: '680M',
    marketCap: '12.1B',
    icon: 'D'
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    price: 7.85,
    change: 0.18,
    changePercent: 2.34,
    volume: '320M',
    marketCap: '9.8B',
    icon: 'P'
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    price: 0.9250,
    change: 0.0180,
    changePercent: 1.99,
    volume: '285M',
    marketCap: '8.6B',
    icon: 'M'
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    price: 38.50,
    change: 0.95,
    changePercent: 2.53,
    volume: '420M',
    marketCap: '14.2B',
    icon: 'A'
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    price: 1.0000,
    change: 0.0000,
    changePercent: 0.00,
    volume: '45.2B',
    marketCap: '91.5B',
    icon: '₮'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    price: 1.0000,
    change: 0.0000,
    changePercent: 0.00,
    volume: '8.5B',
    marketCap: '24.8B',
    icon: '$'
  }
]

export async function GET(request: NextRequest) {
  try {
    console.log('=== CRYPTO API START ===')
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    console.log('✅ Crypto data fetched successfully:', mockCryptoData.length, 'items')
    console.log('=== CRYPTO API END ===')

    return NextResponse.json({
      success: true,
      data: mockCryptoData,
      cached: false,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Crypto API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch crypto data',
      details: (error as Error).message
    }, { status: 500 })
  }
}