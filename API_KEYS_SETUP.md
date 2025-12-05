# Yatırım API Key'leri Yapılandırması

Bu dosya yatırım modülü için gerekli olan tüm API key'lerini içerir.

## API Key'leri ve Kullanım Alanları

### 1. Kripto Para Verileri
- **FREECRYPTOAPI_API_KEY**: Gerçek zamanlı kripto para fiyatları için (FreeCryptoAPI)
- **COINMARKETCAP_API_KEY**: Tarihsel kripto para verileri için (CoinMarketCap)
- **COINGECKO_API_KEY**: Ek kripto para verileri için (CoinGecko)
- **BINANCE_API_KEY**: Binance kripto verileri için

### 2. Hisse Senedi Verileri
- **ALPHA_VANTAGE_API_KEY**: Hisse senedi ve finansal veriler için (Alpha Vantage)
- **FINNHUB_API_KEY**: Gerçek zamanlı hisse senedi fiyatları için (Finnhub)
- **POLYGON_API_KEY**: Finansal veriler ve piyasa verileri için (Polygon.io)
- **YAHOO_FINANCE_API_KEY**: Yahoo Finance verileri için (RapidAPI)

## API Key'lerini Alma

### CoinMarketCap
1. https://coinmarketcap.com/api/ adresine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi kopyalayın

### Alpha Vantage
1. https://www.alphavantage.co/support/#api-key adresine gidin
2. Ücretsiz API key alın
3. API key'inizi kopyalayın

### Finnhub
1. https://finnhub.io/ adresine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi kopyalayın

### Polygon.io
1. https://polygon.io/ adresine gidin
2. Ücretsiz hesap oluşturun
3. API key'inizi kopyalayın

### Yahoo Finance (RapidAPI)
1. https://rapidapi.com/apidojo/api/yahoo-finance1 adresine gidin
2. RapidAPI hesabı oluşturun
3. Yahoo Finance API'sine abone olun
4. API key'inizi kopyalayın

### CoinGecko
1. https://www.coingecko.com/en/api adresine gidin
2. Ücretsiz API key alın (isteğe bağlı, daha yüksek rate limit için)

### Binance
1. https://www.binance.com/en/my/settings/api-management adresine gidin
2. API key oluşturun
3. API key ve secret key'i kopyalayın

## Yapılandırma

API key'lerini aldıktan sonra `.env.local` dosyasındaki `your_..._api_key_here` değerlerini gerçek API key'lerinizle değiştirin.

## Güvenlik Notları

- API key'lerinizi asla GitHub'a veya herkese açık yerlere yüklemeyin
- `.env.local` dosyası `.gitignore` dosyasında listelenmiştir
- Production ortamında environment variables'ı güvenli bir şekilde yapılandırın