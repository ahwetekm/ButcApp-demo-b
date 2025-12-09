import { NextRequest, NextResponse } from 'next/server'

const TCMB_API_KEY = "vidaQMAA0C"
const TCMB_BASE_URL = "https://evds2.tcmb.gov.tr/service/evds"

interface TCMBResponse {
    rows: string[][];
}

interface CurrencyData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    forexBuying: number;
    forexSelling: number;
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== CURRENCY API START ===')
    console.log('📊 Fetching real TCMB data...')
    
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '');
    
    // TCMB API calls for different currency groups
    const currencyCodes = [
      'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'SAR', 
      'AED', 'CAD', 'AUD', 'RUB', 'CNY', 'NOK'
    ].join('-');
    
    // Get current rates
    const currentRatesUrl = `${TCMB_BASE_URL}/series=TP.DK.USD.S.YTL-TP.DK.EUR.S.YTL-TP.DK.GBP.S.YTL-TP.DK.CHF.S.YTL-TP.DK.JPY.S.YTL-TP.DK.SAR.S.YTL-TP.DK.AED.S.YTL-TP.DK.CAD.S.YTL-TP.DK.AUD.S.YTL-TP.DK.RUB.S.YTL-TP.DK.CNY.S.YTL-TP.DK.NOK.S.YTL&startDate=${lastWeek}&endDate=${today}&type=json&key=${TCMB_API_KEY}`;
    
    console.log('🔍 Fetching from TCMB:', currentRatesUrl)
    
    const response = await fetch(currentRatesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ TCMB API error:', response.status, response.statusText);
      throw new Error(`TCMB API returned ${response.status}: ${response.statusText}`);
    }

    const data: TCMBResponse = await response.json();
    
    if (!data.rows || data.rows.length === 0) {
      console.warn('⚠️ No data from TCMB, using fallback data');
      return NextResponse.json({
        success: true,
        data: getFallbackData(),
        cached: false,
        lastUpdated: new Date().toISOString(),
        fallback: true
      });
    }

    // Process TCMB data
    const currencyData: CurrencyData[] = [];
    const currencyNames: Record<string, string> = {
      'USD': 'Amerikan Doları',
      'EUR': 'Euro', 
      'GBP': 'İngiliz Sterlini',
      'CHF': 'İsviçre Frangı',
      'JPY': 'Japon Yeni',
      'SAR': 'Suudi Arabistan Riyali',
      'AED': 'BAE Dirhemi',
      'CAD': 'Kanada Doları',
      'AUD': 'Avustralya Doları',
      'RUB': 'Rus Rublesi',
      'CNY': 'Çin Yuanı',
      'NOK': 'Norveç Kronu'
    };

    // Get the latest row (most recent data)
    const latestRow = data.rows[data.rows.length - 1];
    const previousRow = data.rows.length > 1 ? data.rows[data.rows.length - 2] : latestRow;

    const currencies = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'SAR', 'AED', 'CAD', 'AUD', 'RUB', 'CNY', 'NOK'];
    
    currencies.forEach((currency, index) => {
      const currentIndex = index * 3; // Each currency has 3 values: buying, selling, and another value
      
      if (latestRow[currentIndex] && latestRow[currentIndex + 1]) {
        const forexBuying = parseFloat(latestRow[currentIndex]) || 0;
        const forexSelling = parseFloat(latestRow[currentIndex + 1]) || 0;
        const previousBuying = parseFloat(previousRow[currentIndex]) || forexBuying;
        
        const price = (forexBuying + forexSelling) / 2;
        const change = price - previousBuying;
        const changePercent = previousBuying > 0 ? (change / previousBuying) * 100 : 0;

        currencyData.push({
          symbol: `${currency}/TRY`,
          name: currencyNames[currency] || currency,
          price: price,
          change: change,
          changePercent: changePercent,
          forexBuying: forexBuying,
          forexSelling: forexSelling
        });
      }
    });

    console.log('✅ TCMB data fetched successfully:', currencyData.length, 'currencies');
    console.log('=== CURRENCY API END ===');

    return NextResponse.json({
      success: true,
      data: currencyData,
      cached: false,
      lastUpdated: new Date().toISOString(),
      source: 'TCMB'
    });

  } catch (error) {
    console.error('❌ Currency API error:', error);
    
    // Return fallback data on error
    return NextResponse.json({
      success: true,
      data: getFallbackData(),
      cached: false,
      lastUpdated: new Date().toISOString(),
      fallback: true,
      error: (error as Error).message
    });
  }
}

function getFallbackData(): CurrencyData[] {
  return [
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
  ];
}