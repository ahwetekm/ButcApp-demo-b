import { NextRequest, NextResponse } from 'next/server'

interface HistoricalPriceData {
  date: string
  price: number
  symbol: string
  type: 'currency' | 'crypto'
  source: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== HISTORICAL PRICE API START ===')
    
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const type = searchParams.get('type') as 'currency' | 'crypto'
    const currencyCode = searchParams.get('currencyCode')
    const cryptoId = searchParams.get('cryptoId')
    
    console.log('📅 Historical price request:', { date, type, currencyCode, cryptoId })
    
    if (!date || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: date and type'
      }, { status: 400 })
    }

    // Handle currency historical data
    if (type === 'currency') {
      const symbol = currencyCode || searchParams.get('symbol')
      if (!symbol) {
        return NextResponse.json({
          success: false,
          error: 'Missing currency code or symbol'
        }, { status: 400 })
      }

      // For currency, we'll use TCMB historical XML API
      const historicalPrice = await getHistoricalCurrencyPrice(symbol, date)
      
      if (historicalPrice) {
        return NextResponse.json({
          success: true,
          data: {
            date: date,
            symbol: `${symbol}/TRY`,
            price: historicalPrice,
            type: 'currency',
            source: 'TCMB_HISTORICAL'
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Historical currency data not available for ${symbol} on ${date}`
        })
      }
    }
    
    // Handle crypto historical data
    if (type === 'crypto') {
      const cryptoSymbol = cryptoId || currencyCode
      if (!cryptoSymbol) {
        return NextResponse.json({
          success: false,
          error: 'Missing crypto ID or currency code'
        }, { status: 400 })
      }

      // For crypto, we'll use CoinGecko API (free tier)
      const historicalPrice = await getHistoricalCryptoPrice(cryptoSymbol, date)
      
      if (historicalPrice) {
        return NextResponse.json({
          success: true,
          data: {
            date: date,
            symbol: cryptoSymbol.toUpperCase(),
            price: historicalPrice,
            type: 'crypto',
            source: 'COINGECKO'
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: `Historical crypto data not available for ${cryptoSymbol} on ${date}`
        })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type specified'
    }, { status: 400 })

  } catch (error) {
    console.error('❌ Historical Price API error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}

async function getHistoricalCurrencyPrice(symbol: string, date: string): Promise<number | null> {
  try {
    // Convert date format from YYYY-MM-DD to DD-MM-YYYY for TCMB
    const [year, month, day] = date.split('-')
    const tcmbDate = `${day}-${month}-${year}`
    
    // TCMB historical XML URL
    const xmlUrl = `https://www.tcmb.gov.tr/kurlar/${year}${month}/${day}${month}${year}.xml`
    
    console.log('🔍 Fetching historical currency data from:', xmlUrl)
    
    const response = await fetch(xmlUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TCMB-Client/1.0)',
        'Accept': 'application/xml,text/xml',
      },
      cache: 'no-store',
      timeout: 10000
    })

    if (!response.ok) {
      console.warn(`⚠️ TCMB historical API error: ${response.status} for date ${date}`)
      return null
    }

    const xmlText = await response.text()
    
    // Parse XML for the specific currency
    const currencyRegex = new RegExp(
      `<Currency[^>]*Kod="${symbol}"[^>]*>[\\s\\S]*?<ForexBuying>([^<]*)</ForexBuying>[\\s\\S]*?<ForexSelling>([^<]*)</ForexSelling>`,
      'g'
    )
    
    const match = currencyRegex.exec(xmlText)
    
    if (match) {
      const forexBuying = parseFloat(match[1].replace(',', '.')) || 0
      const forexSelling = parseFloat(match[2].replace(',', '.')) || 0
      
      if (forexBuying > 0 && forexSelling > 0) {
        const price = (forexBuying + forexSelling) / 2
        console.log(`✅ Historical ${symbol} price for ${date}: ${price}`)
        return price
      }
    }
    
    console.warn(`⚠️ No valid data found for ${symbol} on ${date}`)
    return null
    
  } catch (error) {
    console.error(`❌ Error fetching historical currency price for ${symbol}:`, error)
    return null
  }
}

async function getHistoricalCryptoPrice(symbol: string, date: string): Promise<number | null> {
  try {
    // Convert date to timestamp for CoinGecko API
    const targetDate = new Date(date)
    const timestamp = Math.floor(targetDate.getTime() / 1000)
    
    // Map common crypto symbols to CoinGecko IDs
    const cryptoMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'BUSD': 'binance-usd',
      'SHIB': 'shiba-inu',
      'LTC': 'litecoin',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'ATOM': 'cosmos',
      'XLM': 'stellar',
      'VET': 'vechain'
    }
    
    const coinId = cryptoMap[symbol.toUpperCase()] || symbol.toLowerCase()
    
    // CoinGecko historical price API - Use YYYY-MM-DD format
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${coinId}/history?date=${date}`
    
    console.log('🔍 Fetching historical crypto data from:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Crypto-Client/1.0)',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      timeout: 10000
    })

    if (!response.ok) {
      console.warn(`⚠️ CoinGecko API error: ${response.status} for ${symbol} on ${date}`)
      return null
    }

    const data = await response.json()
    
    if (data && data.market_data && data.market_data.current_price && data.market_data.current_price.usd) {
      const price = data.market_data.current_price.usd
      console.log(`✅ Historical ${symbol} price for ${date}: $${price}`)
      return price
    }
    
    console.warn(`⚠️ No price data found for ${symbol} on ${date}`)
    return null
    
  } catch (error) {
    console.error(`❌ Error fetching historical crypto price for ${symbol}:`, error)
    return null
  }
}