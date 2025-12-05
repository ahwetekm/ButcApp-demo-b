import { NextRequest, NextResponse } from 'next/server'

interface CryptoItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  icon?: string
}

interface FreeCryptoAPIResponse {
  status: string
  symbols: Array<{
    symbol: string
    last: string
    last_btc: string
    lowest: string
    highest: string
    date: string
    daily_change_percentage: string
    source_exchange: string
  }>
  loaded_time: number
}

const CRYPTO_ICONS: Record<string, string> = {
  'BTC': 'text-orange-500',
  'ETH': 'text-blue-500',
  'BNB': 'text-yellow-500',
  'SOL': 'text-purple-500',
  'XRP': 'text-gray-600',
  'ADA': 'text-blue-600',
  'DOGE': 'text-amber-500',
  'DOT': 'text-pink-500',
  'MATIC': 'text-purple-600',
  'AVAX': 'text-red-500',
  'SHIB': 'text-orange-600',
  'LTC': 'text-gray-500',
  'LINK': 'text-blue-400',
  'UNI': 'text-pink-400',
  'ATOM': 'text-indigo-500',
  'FIL': 'text-blue-600',
  'CRO': 'text-blue-700',
  'VET': 'text-green-600',
  'TRX': 'text-red-600',
  'XLM': 'text-purple-400',
  'AAVE': 'text-purple-700',
  'MKR': 'text-green-500',
  'COMP': 'text-yellow-600',
  'SUSHI': 'text-pink-500',
  'CRV': 'text-red-500',
  'YFI': 'text-blue-800',
  'SNX': 'text-indigo-600',
  'REN': 'text-green-400',
  'ZRX': 'text-purple-500',
  'BAND': 'text-blue-500',
  'UMA': 'text-orange-600',
  'BAL': 'text-yellow-500',
  '1INCH': 'text-cyan-500'
}

async function fetchCryptoData(): Promise<CryptoItem[]> {
  // FreeCryptoAPI anahtarı
  const apiKey = process.env.FREECRYPTOAPI_API_KEY || '6lfnrxu8889pmxri1y7v'
  
  console.log('Using FreeCryptoAPI key:', apiKey.substring(0, 10) + '...')

  try {
    // FreeCryptoAPI - popüler kripto paralar
    const symbols = 'BTC+ETH+BNB+SOL+XRP+ADA+DOGE+DOT+MATIC+AVAX+SHIB+LTC+LINK+UNI+ATOM+XLM+VET+TRX+USDT+USDC+BUSD'
    
    const response = await fetch(`https://api.freecryptoapi.com/v1/getData?token=${apiKey}&symbol=${symbols}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FreeCryptoAPIResponse = await response.json()
    
    if (data.status !== 'success') {
      throw new Error(`FreeCryptoAPI error: Failed to fetch data`)
    }

    console.log('✅ Successfully fetched real crypto data from FreeCryptoAPI')
    
    // Kripto para isimlerini eşleştir
    const cryptoNames: Record<string, string> = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum', 
      'BNB': 'Binance Coin',
      'SOL': 'Solana',
      'XRP': 'Ripple',
      'ADA': 'Cardano',
      'DOGE': 'Dogecoin',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'AVAX': 'Avalanche',
      'SHIB': 'Shiba Inu',
      'LTC': 'Litecoin',
      'LINK': 'Chainlink',
      'UNI': 'Uniswap',
      'ATOM': 'Cosmos',
      'XLM': 'Stellar',
      'VET': 'VeChain',
      'TRX': 'TRON',
      'USDT': 'Tether',
      'USDC': 'USD Coin',
      'BUSD': 'Binance USD'
    }
    
    return data.symbols.map(crypto => {
      const price = parseFloat(crypto.last)
      const changePercent = parseFloat(crypto.daily_change_percentage)
      const change = price * (changePercent / 100)
      
      return {
        symbol: crypto.symbol,
        name: cryptoNames[crypto.symbol] || crypto.symbol,
        price: price,
        change: change,
        changePercent: changePercent,
        volume: 'N/A', // FreeCryptoAPI volume sağlamıyor
        marketCap: 'N/A', // FreeCryptoAPI market cap sağlamıyor
        icon: CRYPTO_ICONS[crypto.symbol] || 'text-gray-500'
      }
    })
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    // Hata durumunda boş dizi döndür, mock veri kullanma
    throw new Error(`Failed to fetch crypto data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    const cryptoData = await fetchCryptoData()
    
    return NextResponse.json({
      success: true,
      data: cryptoData,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Crypto API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch crypto data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}