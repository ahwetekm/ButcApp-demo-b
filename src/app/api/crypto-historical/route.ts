import { NextRequest, NextResponse } from 'next/server'

interface CryptoHistoricalItem {
  symbol: string
  name: string
  price: number
  timestamp: string
}

interface CoinMarketCapHistoricalResponse {
  status: {
    timestamp: string
    error_code: number
    error_message: string
    elapsed: number
    credit_count: number
  }
  data: {
    [symbol: string]: {
      quote: {
        USD: {
          price: number
          volume_24h: number
          market_cap: number
          timestamp: string
        }
      }
    }
  }
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
  'AVAX': 'text-red-500'
}

async function fetchCryptoHistoricalData(date: string, cryptoId?: string) {
  try {
    const apiKey = process.env.COINMARKETCAP_API_KEY
    
    if (!apiKey || apiKey === 'your_coinmarketcap_api_key_here') {
      console.warn('CoinMarketCap API key not configured')
      return null
    }

    // Convert date to timestamp (start of day)
    const targetDate = new Date(date)
    const timestamp = Math.floor(targetDate.getTime() / 1000)
    
    // Map crypto IDs to CoinMarketCap symbols
    const cryptoMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'cardano': 'ADA'
    }
    
    const symbol = cryptoMap[cryptoId || 'bitcoin'] || 'BTC'
    
    // CoinMarketCap historical endpoint
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/historical?symbol=${symbol}&time_start=${timestamp}&time_end=${timestamp + 86400}&convert=USD`
    
    const response = await fetch(url, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    })
    
    if (!response.ok) {
      console.warn(`CoinMarketCap API failed for ${symbol} on ${date}, status: ${response.status}`)
      return null
    }
    
    const data: CoinMarketCapHistoricalResponse = await response.json()
    
    if (data.status.error_code !== 0) {
      console.warn(`CoinMarketCap API error: ${data.status.error_message}`)
      return null
    }
    
    // Extract the price from the historical data
    const quotes = data.data[symbol]
    if (!quotes || !quotes.quote || !quotes.quote.USD) {
      console.warn(`No price data found for ${symbol} on ${date}`)
      return null
    }
    
    const price = quotes.quote.USD.price
    const cryptoName = cryptoId === 'ethereum' ? 'Ethereum' : 
                     cryptoId === 'binancecoin' ? 'Binance Coin' :
                     cryptoId === 'solana' ? 'Solana' :
                     cryptoId === 'cardano' ? 'Cardano' :
                     cryptoId?.charAt(0).toUpperCase() + cryptoId?.slice(1) || 'Bitcoin'
    
    return {
      symbol: symbol,
      name: cryptoName,
      price: price,
      timestamp: new Date(date).toISOString()
    }
  } catch (error) {
    console.error('Error fetching crypto historical data:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const cryptoId = searchParams.get('cryptoId')
    
    if (!date) {
      return NextResponse.json({
        success: false,
        error: 'Date parameter is required'
      }, { status: 400 })
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      }, { status: 400 })
    }
    
    // Don't allow future dates
    const inputDate = new Date(date)
    const today = new Date()
    if (inputDate > today) {
      return NextResponse.json({
        success: false,
        error: 'Date cannot be in future'
      }, { status: 400 })
    }
    
    let result: CryptoHistoricalItem[] = []
    
    if (cryptoId) {
      // Fetch specific crypto data
      const cryptoData = await fetchCryptoHistoricalData(date, cryptoId)
      if (cryptoData) {
        result = [cryptoData]
      }
    } else {
      // Fetch top 5 cryptocurrencies for date
      const topCryptos = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano']
      const promises = topCryptos.map(async (id) => {
        const data = await fetchCryptoHistoricalData(date, id)
        return data
      })
      
      const results = await Promise.allSettled(promises)
      result = results
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null)
        .map((result) => result.value)
    }
    
    // If no data from API, return error
    if (result.length === 0) {
      console.warn(`No crypto data available for ${date}`)
      return NextResponse.json({
        success: false,
        error: `No historical crypto data available for ${date}. CoinMarketCap API may not have data for this date or API key is missing.`,
        date: date,
        cryptoId: cryptoId,
        timestamp: new Date().toISOString()
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: result,
      date: date,
      cryptoId: cryptoId,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Crypto historical API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch crypto historical data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}