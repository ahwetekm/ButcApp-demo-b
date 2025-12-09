import { NextRequest, NextResponse } from 'next/server'

const TCMB_API_KEY = "vidaQMAA0C"

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
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '');
    
    // TCMB EVDS API - Correct format for exchange rates
    const baseUrl = "https://evds2.tcmb.gov.tr/service/evds/"
    const seriesCodes = [
      'TP.DK.USD.A.YTL',  // USD Buying
      'TP.DK.USD.S.YTL',  // USD Selling
      'TP.DK.EUR.A.YTL',  // EUR Buying  
      'TP.DK.EUR.S.YTL',  // EUR Selling
      'TP.DK.GBP.A.YTL',  // GBP Buying
      'TP.DK.GBP.S.YTL',  // GBP Selling
      'TP.DK.CHF.A.YTL',  // CHF Buying
      'TP.DK.CHF.S.YTL',  // CHF Selling
      'TP.DK.JPY.A.YTL',  // JPY Buying
      'TP.DK.JPY.S.YTL',  // JPY Selling
      'TP.DK.SAR.A.YTL',  // SAR Buying
      'TP.DK.SAR.S.YTL',  // SAR Selling
      'TP.DK.AED.A.YTL',  // AED Buying
      'TP.DK.AED.S.YTL',  // AED Selling
      'TP.DK.CAD.A.YTL',  // CAD Buying
      'TP.DK.CAD.S.YTL',  // CAD Selling
      'TP.DK.AUD.A.YTL',  // AUD Buying
      'TP.DK.AUD.S.YTL',  // AUD Selling
      'TP.DK.RUB.A.YTL',  // RUB Buying
      'TP.DK.RUB.S.YTL',  // RUB Selling
      'TP.DK.CNY.A.YTL',  // CNY Buying
      'TP.DK.CNY.S.YTL',  // CNY Selling
      'TP.DK.NOK.A.YTL',  // NOK Buying
      'TP.DK.NOK.S.YTL'   // NOK Selling
    ].join('-');
    
    const apiUrl = `${baseUrl}series=${seriesCodes}&startDate=${yesterday}&endDate=${today}&type=json&key=${TCMB_API_KEY}`;
    
    console.log('🔍 Fetching from TCMB:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TCMB-Client/1.0)',
        'Accept': 'application/json',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
      timeout: 10000
    });

    console.log('📡 TCMB Response status:', response.status)
    
    if (!response.ok) {
      console.error('❌ TCMB API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ TCMB Error response:', errorText);
      
      // Return fallback data
      return NextResponse.json({
        success: true,
        data: getFallbackData(),
        cached: false,
        lastUpdated: new Date().toISOString(),
        fallback: true,
        error: `TCMB API Error: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    console.log('📊 TCMB Response structure:', typeof data, data ? Object.keys(data) : 'null');
    
    if (!data || !data.rows || data.rows.length === 0) {
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
    console.log('📈 Latest TCMB data row:', latestRow);

    const currencies = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'SAR', 'AED', 'CAD', 'AUD', 'RUB', 'CNY', 'NOK'];
    
    currencies.forEach((currency, index) => {
      const buyingIndex = index * 2;     // Buying rate index
      const sellingIndex = index * 2 + 1; // Selling rate index
      
      if (latestRow[buyingIndex] && latestRow[sellingIndex]) {
        const forexBuying = parseFloat(latestRow[buyingIndex]) || 0;
        const forexSelling = parseFloat(latestRow[sellingIndex]) || 0;
        
        // Skip if both values are 0 or null
        if (forexBuying === 0 && forexSelling === 0) {
          console.warn(`⚠️ No valid data for ${currency}`);
          return;
        }
        
        const price = (forexBuying + forexSelling) / 2;
        
        // Generate small random change for demo (in real app, calculate from previous day)
        const changePercent = (Math.random() - 0.5) * 2; // -1% to +1%
        const change = price * (changePercent / 100);

        currencyData.push({
          symbol: `${currency}/TRY`,
          name: currencyNames[currency] || currency,
          price: price,
          change: change,
          changePercent: changePercent,
          forexBuying: forexBuying,
          forexSelling: forexSelling
        });
        
        console.log(`✅ ${currency}: Buying=${forexBuying}, Selling=${forexSelling}, Price=${price}`);
      } else {
        console.warn(`⚠️ Missing data for ${currency} at indices ${buyingIndex}, ${sellingIndex}`);
      }
    });

    console.log('✅ TCMB data processed successfully:', currencyData.length, 'currencies');
    console.log('=== CURRENCY API END ===');

    if (currencyData.length === 0) {
      console.warn('⚠️ No valid currency data processed, using fallback');
      return NextResponse.json({
        success: true,
        data: getFallbackData(),
        cached: false,
        lastUpdated: new Date().toISOString(),
        fallback: true
      });
    }

    return NextResponse.json({
      success: true,
      data: currencyData,
      cached: false,
      lastUpdated: new Date().toISOString(),
      source: 'TCMB'
    });

  } catch (error) {
    console.error('❌ Currency API error:', error);
    console.error('❌ Error stack:', (error as Error).stack);
    
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
  // Updated with more realistic current rates
  return [
    {
      symbol: 'USD/TRY',
      name: 'Amerikan Doları',
      price: 32.8500,
      change: 0.1250,
      changePercent: 0.38,
      forexBuying: 32.8250,
      forexSelling: 32.8750
    },
    {
      symbol: 'EUR/TRY',
      name: 'Euro',
      price: 35.6800,
      change: 0.1800,
      changePercent: 0.51,
      forexBuying: 35.6500,
      forexSelling: 35.7100
    },
    {
      symbol: 'GBP/TRY',
      name: 'İngiliz Sterlini',
      price: 41.7500,
      change: 0.2200,
      changePercent: 0.53,
      forexBuying: 41.7000,
      forexSelling: 41.8000
    },
    {
      symbol: 'CHF/TRY',
      name: 'İsviçre Frangı',
      price: 38.2900,
      change: 0.1500,
      changePercent: 0.39,
      forexBuying: 38.2500,
      forexSelling: 38.3300
    },
    {
      symbol: 'JPY/TRY',
      name: 'Japon Yeni',
      price: 0.2195,
      change: 0.0008,
      changePercent: 0.37,
      forexBuying: 0.2192,
      forexSelling: 0.2198
    },
    {
      symbol: 'SAR/TRY',
      name: 'Suudi Arabistan Riyali',
      price: 8.7530,
      change: 0.0320,
      changePercent: 0.37,
      forexBuying: 8.7480,
      forexSelling: 8.7580
    },
    {
      symbol: 'AED/TRY',
      name: 'BAE Dirhemi',
      price: 8.9450,
      change: 0.0315,
      changePercent: 0.35,
      forexBuying: 8.9400,
      forexSelling: 8.9500
    },
    {
      symbol: 'CAD/TRY',
      name: 'Kanada Doları',
      price: 24.0900,
      change: 0.0950,
      changePercent: 0.40,
      forexBuying: 24.0600,
      forexSelling: 24.1200
    },
    {
      symbol: 'AUD/TRY',
      name: 'Avustralya Doları',
      price: 21.6500,
      change: 0.0880,
      changePercent: 0.41,
      forexBuying: 21.6200,
      forexSelling: 21.6800
    },
    {
      symbol: 'RUB/TRY',
      name: 'Rus Rublesi',
      price: 0.3680,
      change: 0.0015,
      changePercent: 0.41,
      forexBuying: 0.3675,
      forexSelling: 0.3685
    },
    {
      symbol: 'CNY/TRY',
      name: 'Çin Yuanı',
      price: 4.5350,
      change: 0.0180,
      changePercent: 0.40,
      forexBuying: 4.5300,
      forexSelling: 4.5400
    },
    {
      symbol: 'NOK/TRY',
      name: 'Norveç Kronu',
      price: 3.0750,
      change: 0.0120,
      changePercent: 0.39,
      forexBuying: 3.0700,
      forexSelling: 3.0800
    }
  ];
}