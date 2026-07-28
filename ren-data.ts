// Deterministic mock generator for REN institutional demo.
// All numbers derived from seeded hashes of the asset pair, so a given
// (A,B) is stable across reloads until "refresh" nudges the seed.

export type Asset = {
  symbol: string;
  name: string;
  sector: string;
  // Optional metadata surfaced by multi-provider search (Yahoo/CoinGecko/etc).
  // Not required by any deterministic-analysis code path.
  provider?: string;
  assetClass?: string;
  exchange?: string;
  currency?: string;
  region?: string;
};

// NOTE: buildRankings() references the first 24 entries by index — do not
// reorder or remove any of the leading tickers below. Append new assets only.
export const ASSETS: Asset[] = [
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Semiconductors" },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Consumer Tech" },
  { symbol: "MSFT", name: "Microsoft Corp.", sector: "Software" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Internet" },
  { symbol: "AMZN", name: "Amazon.com", sector: "E-Commerce / Cloud" },
  { symbol: "META", name: "Meta Platforms", sector: "Internet" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "EV / Energy" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors" },
  { symbol: "TSM", name: "Taiwan Semiconductor", sector: "Semiconductors" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Semiconductors" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Banking" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Banking" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "CVX", name: "Chevron Corp.", sector: "Energy" },
  { symbol: "COST", name: "Costco Wholesale", sector: "Retail" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Retail" },
  { symbol: "V", name: "Visa Inc.", sector: "Payments" },
  { symbol: "MA", name: "Mastercard", sector: "Payments" },
  { symbol: "UNH", name: "UnitedHealth", sector: "Healthcare" },
  { symbol: "LLY", name: "Eli Lilly", sector: "Pharma" },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Software / Defense" },
  { symbol: "COIN", name: "Coinbase Global", sector: "Crypto / Fintech" },
  { symbol: "SPY", name: "S&P 500 ETF", sector: "Broad Market" },
  { symbol: "QQQ", name: "Nasdaq-100 ETF", sector: "Tech Index" },

  // --- Mega/large cap tech & internet ---
  { symbol: "GOOG", name: "Alphabet Inc. (Class C)", sector: "Internet" },
  { symbol: "ORCL", name: "Oracle Corp.", sector: "Software" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Software" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Software" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Media / Streaming" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Media" },
  { symbol: "CMCSA", name: "Comcast Corp.", sector: "Media / Telecom" },
  { symbol: "T", name: "AT&T Inc.", sector: "Telecom" },
  { symbol: "VZ", name: "Verizon Communications", sector: "Telecom" },
  { symbol: "TMUS", name: "T-Mobile US", sector: "Telecom" },
  { symbol: "INTC", name: "Intel Corp.", sector: "Semiconductors" },
  { symbol: "QCOM", name: "Qualcomm Inc.", sector: "Semiconductors" },
  { symbol: "MU", name: "Micron Technology", sector: "Semiconductors" },
  { symbol: "TXN", name: "Texas Instruments", sector: "Semiconductors" },
  { symbol: "ASML", name: "ASML Holding", sector: "Semiconductors" },
  { symbol: "LRCX", name: "Lam Research", sector: "Semiconductors" },
  { symbol: "AMAT", name: "Applied Materials", sector: "Semiconductors" },
  { symbol: "KLAC", name: "KLA Corp.", sector: "Semiconductors" },
  { symbol: "MRVL", name: "Marvell Technology", sector: "Semiconductors" },
  { symbol: "ARM", name: "Arm Holdings", sector: "Semiconductors" },
  { symbol: "SMCI", name: "Super Micro Computer", sector: "Hardware / AI" },
  { symbol: "DELL", name: "Dell Technologies", sector: "Hardware" },
  { symbol: "HPQ", name: "HP Inc.", sector: "Hardware" },
  { symbol: "IBM", name: "IBM Corp.", sector: "Software / Services" },
  { symbol: "CSCO", name: "Cisco Systems", sector: "Networking" },
  { symbol: "NOW", name: "ServiceNow", sector: "Software" },
  { symbol: "SNOW", name: "Snowflake Inc.", sector: "Software / Data" },
  { symbol: "DDOG", name: "Datadog Inc.", sector: "Software" },
  { symbol: "MDB", name: "MongoDB Inc.", sector: "Software / Data" },
  { symbol: "NET", name: "Cloudflare Inc.", sector: "Software / Infra" },
  { symbol: "ZS", name: "Zscaler Inc.", sector: "Cybersecurity" },
  { symbol: "CRWD", name: "CrowdStrike Holdings", sector: "Cybersecurity" },
  { symbol: "PANW", name: "Palo Alto Networks", sector: "Cybersecurity" },
  { symbol: "FTNT", name: "Fortinet Inc.", sector: "Cybersecurity" },
  { symbol: "OKTA", name: "Okta Inc.", sector: "Cybersecurity" },
  { symbol: "SHOP", name: "Shopify Inc.", sector: "E-Commerce" },
  { symbol: "SQ", name: "Block Inc.", sector: "Fintech" },
  { symbol: "PYPL", name: "PayPal Holdings", sector: "Fintech" },
  { symbol: "ABNB", name: "Airbnb Inc.", sector: "Travel / Internet" },
  { symbol: "UBER", name: "Uber Technologies", sector: "Mobility" },
  { symbol: "LYFT", name: "Lyft Inc.", sector: "Mobility" },
  { symbol: "DASH", name: "DoorDash Inc.", sector: "Delivery" },
  { symbol: "SPOT", name: "Spotify Technology", sector: "Media / Streaming" },
  { symbol: "ROKU", name: "Roku Inc.", sector: "Media / Streaming" },
  { symbol: "PINS", name: "Pinterest Inc.", sector: "Internet" },
  { symbol: "SNAP", name: "Snap Inc.", sector: "Internet" },
  { symbol: "RBLX", name: "Roblox Corp.", sector: "Gaming" },
  { symbol: "EA", name: "Electronic Arts", sector: "Gaming" },
  { symbol: "TTWO", name: "Take-Two Interactive", sector: "Gaming" },
  { symbol: "U", name: "Unity Software", sector: "Gaming / Software" },
  { symbol: "BABA", name: "Alibaba Group", sector: "E-Commerce" },
  { symbol: "JD", name: "JD.com Inc.", sector: "E-Commerce" },
  { symbol: "PDD", name: "PDD Holdings", sector: "E-Commerce" },
  { symbol: "BIDU", name: "Baidu Inc.", sector: "Internet" },
  { symbol: "NIO", name: "NIO Inc.", sector: "EV" },
  { symbol: "XPEV", name: "XPeng Inc.", sector: "EV" },
  { symbol: "LI", name: "Li Auto Inc.", sector: "EV" },
  { symbol: "RIVN", name: "Rivian Automotive", sector: "EV" },
  { symbol: "LCID", name: "Lucid Group", sector: "EV" },
  { symbol: "F", name: "Ford Motor Co.", sector: "Autos" },
  { symbol: "GM", name: "General Motors", sector: "Autos" },
  { symbol: "STLA", name: "Stellantis", sector: "Autos" },
  { symbol: "TM", name: "Toyota Motor", sector: "Autos" },
  { symbol: "HMC", name: "Honda Motor", sector: "Autos" },

  // --- Financials ---
  { symbol: "BAC", name: "Bank of America", sector: "Banking" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Banking" },
  { symbol: "C", name: "Citigroup", sector: "Banking" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Banking" },
  { symbol: "SCHW", name: "Charles Schwab", sector: "Brokerage" },
  { symbol: "BLK", name: "BlackRock Inc.", sector: "Asset Management" },
  { symbol: "BX", name: "Blackstone Inc.", sector: "Private Equity" },
  { symbol: "KKR", name: "KKR & Co.", sector: "Private Equity" },
  { symbol: "APO", name: "Apollo Global Management", sector: "Private Equity" },
  { symbol: "AXP", name: "American Express", sector: "Payments" },
  { symbol: "COF", name: "Capital One Financial", sector: "Banking" },
  { symbol: "USB", name: "U.S. Bancorp", sector: "Banking" },
  { symbol: "PNC", name: "PNC Financial Services", sector: "Banking" },
  { symbol: "TFC", name: "Truist Financial", sector: "Banking" },
  { symbol: "HSBC", name: "HSBC Holdings", sector: "Banking" },
  { symbol: "BCS", name: "Barclays PLC", sector: "Banking" },
  { symbol: "DB", name: "Deutsche Bank", sector: "Banking" },
  { symbol: "UBS", name: "UBS Group", sector: "Banking" },
  { symbol: "BRK.B", name: "Berkshire Hathaway (B)", sector: "Conglomerate" },
  { symbol: "CME", name: "CME Group", sector: "Exchanges" },
  { symbol: "ICE", name: "Intercontinental Exchange", sector: "Exchanges" },
  { symbol: "NDAQ", name: "Nasdaq Inc.", sector: "Exchanges" },
  { symbol: "SPGI", name: "S&P Global", sector: "Financial Data" },
  { symbol: "MCO", name: "Moody's Corp.", sector: "Financial Data" },
  { symbol: "MSCI", name: "MSCI Inc.", sector: "Financial Data" },

  // --- Healthcare & pharma ---
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Pharma" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Pharma" },
  { symbol: "MRK", name: "Merck & Co.", sector: "Pharma" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Pharma" },
  { symbol: "BMY", name: "Bristol-Myers Squibb", sector: "Pharma" },
  { symbol: "AZN", name: "AstraZeneca", sector: "Pharma" },
  { symbol: "NVO", name: "Novo Nordisk", sector: "Pharma" },
  { symbol: "GSK", name: "GSK plc", sector: "Pharma" },
  { symbol: "SNY", name: "Sanofi", sector: "Pharma" },
  { symbol: "AMGN", name: "Amgen Inc.", sector: "Biotech" },
  { symbol: "GILD", name: "Gilead Sciences", sector: "Biotech" },
  { symbol: "REGN", name: "Regeneron Pharmaceuticals", sector: "Biotech" },
  { symbol: "VRTX", name: "Vertex Pharmaceuticals", sector: "Biotech" },
  { symbol: "BIIB", name: "Biogen Inc.", sector: "Biotech" },
  { symbol: "MRNA", name: "Moderna Inc.", sector: "Biotech" },
  { symbol: "ISRG", name: "Intuitive Surgical", sector: "Medical Devices" },
  { symbol: "MDT", name: "Medtronic plc", sector: "Medical Devices" },
  { symbol: "TMO", name: "Thermo Fisher Scientific", sector: "Life Sciences" },
  { symbol: "DHR", name: "Danaher Corp.", sector: "Life Sciences" },
  { symbol: "ABT", name: "Abbott Laboratories", sector: "Medical Devices" },
  { symbol: "CVS", name: "CVS Health", sector: "Healthcare" },
  { symbol: "CI", name: "Cigna Group", sector: "Healthcare" },
  { symbol: "HUM", name: "Humana Inc.", sector: "Healthcare" },
  { symbol: "ELV", name: "Elevance Health", sector: "Healthcare" },

  // --- Consumer & retail ---
  { symbol: "HD", name: "Home Depot", sector: "Retail" },
  { symbol: "LOW", name: "Lowe's Companies", sector: "Retail" },
  { symbol: "TGT", name: "Target Corp.", sector: "Retail" },
  { symbol: "KR", name: "Kroger Co.", sector: "Retail" },
  { symbol: "DG", name: "Dollar General", sector: "Retail" },
  { symbol: "DLTR", name: "Dollar Tree", sector: "Retail" },
  { symbol: "BBY", name: "Best Buy", sector: "Retail" },
  { symbol: "TJX", name: "TJX Companies", sector: "Retail" },
  { symbol: "ROST", name: "Ross Stores", sector: "Retail" },
  { symbol: "ULTA", name: "Ulta Beauty", sector: "Retail" },
  { symbol: "LULU", name: "Lululemon Athletica", sector: "Apparel" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Apparel" },
  { symbol: "ADDYY", name: "Adidas AG", sector: "Apparel" },
  { symbol: "SBUX", name: "Starbucks Corp.", sector: "Restaurants" },
  { symbol: "MCD", name: "McDonald's Corp.", sector: "Restaurants" },
  { symbol: "CMG", name: "Chipotle Mexican Grill", sector: "Restaurants" },
  { symbol: "YUM", name: "Yum! Brands", sector: "Restaurants" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Beverages" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Beverages" },
  { symbol: "MDLZ", name: "Mondelez International", sector: "Consumer Staples" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples" },
  { symbol: "CL", name: "Colgate-Palmolive", sector: "Consumer Staples" },
  { symbol: "KMB", name: "Kimberly-Clark", sector: "Consumer Staples" },
  { symbol: "UL", name: "Unilever plc", sector: "Consumer Staples" },
  { symbol: "NSRGY", name: "Nestlé SA", sector: "Consumer Staples" },
  { symbol: "PM", name: "Philip Morris International", sector: "Tobacco" },
  { symbol: "MO", name: "Altria Group", sector: "Tobacco" },
  { symbol: "BUD", name: "Anheuser-Busch InBev", sector: "Beverages" },
  { symbol: "DEO", name: "Diageo plc", sector: "Beverages" },
  { symbol: "EL", name: "Estée Lauder Companies", sector: "Consumer" },
  { symbol: "LVMUY", name: "LVMH", sector: "Luxury" },

  // --- Industrials / defense / transport ---
  { symbol: "BA", name: "Boeing Co.", sector: "Aerospace" },
  { symbol: "LMT", name: "Lockheed Martin", sector: "Defense" },
  { symbol: "RTX", name: "RTX Corp.", sector: "Aerospace / Defense" },
  { symbol: "NOC", name: "Northrop Grumman", sector: "Defense" },
  { symbol: "GD", name: "General Dynamics", sector: "Defense" },
  { symbol: "HII", name: "Huntington Ingalls", sector: "Defense" },
  { symbol: "GE", name: "GE Aerospace", sector: "Aerospace" },
  { symbol: "HON", name: "Honeywell International", sector: "Industrials" },
  { symbol: "MMM", name: "3M Co.", sector: "Industrials" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Machinery" },
  { symbol: "DE", name: "Deere & Co.", sector: "Machinery" },
  { symbol: "EMR", name: "Emerson Electric", sector: "Industrials" },
  { symbol: "ETN", name: "Eaton Corp.", sector: "Industrials" },
  { symbol: "ITW", name: "Illinois Tool Works", sector: "Industrials" },
  { symbol: "UPS", name: "United Parcel Service", sector: "Logistics" },
  { symbol: "FDX", name: "FedEx Corp.", sector: "Logistics" },
  { symbol: "DAL", name: "Delta Air Lines", sector: "Airlines" },
  { symbol: "UAL", name: "United Airlines", sector: "Airlines" },
  { symbol: "AAL", name: "American Airlines", sector: "Airlines" },
  { symbol: "LUV", name: "Southwest Airlines", sector: "Airlines" },
  { symbol: "UNP", name: "Union Pacific", sector: "Railroads" },
  { symbol: "CSX", name: "CSX Corp.", sector: "Railroads" },
  { symbol: "NSC", name: "Norfolk Southern", sector: "Railroads" },

  // --- Energy & materials ---
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy" },
  { symbol: "OXY", name: "Occidental Petroleum", sector: "Energy" },
  { symbol: "SLB", name: "Schlumberger", sector: "Energy Services" },
  { symbol: "HAL", name: "Halliburton Co.", sector: "Energy Services" },
  { symbol: "EOG", name: "EOG Resources", sector: "Energy" },
  { symbol: "MPC", name: "Marathon Petroleum", sector: "Energy" },
  { symbol: "PSX", name: "Phillips 66", sector: "Energy" },
  { symbol: "VLO", name: "Valero Energy", sector: "Energy" },
  { symbol: "SHEL", name: "Shell plc", sector: "Energy" },
  { symbol: "BP", name: "BP plc", sector: "Energy" },
  { symbol: "TTE", name: "TotalEnergies SE", sector: "Energy" },
  { symbol: "ENB", name: "Enbridge Inc.", sector: "Pipelines" },
  { symbol: "KMI", name: "Kinder Morgan", sector: "Pipelines" },
  { symbol: "LIN", name: "Linde plc", sector: "Chemicals" },
  { symbol: "APD", name: "Air Products & Chemicals", sector: "Chemicals" },
  { symbol: "SHW", name: "Sherwin-Williams", sector: "Chemicals" },
  { symbol: "DOW", name: "Dow Inc.", sector: "Chemicals" },
  { symbol: "DD", name: "DuPont de Nemours", sector: "Chemicals" },
  { symbol: "NEM", name: "Newmont Corp.", sector: "Gold Mining" },
  { symbol: "GOLD", name: "Barrick Gold", sector: "Gold Mining" },
  { symbol: "FCX", name: "Freeport-McMoRan", sector: "Copper Mining" },
  { symbol: "SCCO", name: "Southern Copper", sector: "Copper Mining" },
  { symbol: "AA", name: "Alcoa Corp.", sector: "Aluminum" },
  { symbol: "CLF", name: "Cleveland-Cliffs", sector: "Steel" },
  { symbol: "X", name: "United States Steel", sector: "Steel" },
  { symbol: "NUE", name: "Nucor Corp.", sector: "Steel" },

  // --- Utilities & real estate ---
  { symbol: "NEE", name: "NextEra Energy", sector: "Utilities" },
  { symbol: "DUK", name: "Duke Energy", sector: "Utilities" },
  { symbol: "SO", name: "Southern Co.", sector: "Utilities" },
  { symbol: "AEP", name: "American Electric Power", sector: "Utilities" },
  { symbol: "D", name: "Dominion Energy", sector: "Utilities" },
  { symbol: "EXC", name: "Exelon Corp.", sector: "Utilities" },
  { symbol: "SRE", name: "Sempra", sector: "Utilities" },
  { symbol: "PLD", name: "Prologis Inc.", sector: "REIT" },
  { symbol: "AMT", name: "American Tower", sector: "REIT" },
  { symbol: "EQIX", name: "Equinix Inc.", sector: "REIT / Data Centers" },
  { symbol: "DLR", name: "Digital Realty Trust", sector: "REIT / Data Centers" },
  { symbol: "O", name: "Realty Income Corp.", sector: "REIT" },
  { symbol: "SPG", name: "Simon Property Group", sector: "REIT" },
  { symbol: "PSA", name: "Public Storage", sector: "REIT" },

  // --- Fintech / crypto-adjacent ---
  { symbol: "HOOD", name: "Robinhood Markets", sector: "Fintech" },
  { symbol: "SOFI", name: "SoFi Technologies", sector: "Fintech" },
  { symbol: "AFRM", name: "Affirm Holdings", sector: "Fintech" },
  { symbol: "MSTR", name: "MicroStrategy Inc.", sector: "Crypto / Software" },
  { symbol: "RIOT", name: "Riot Platforms", sector: "Crypto Mining" },
  { symbol: "MARA", name: "Marathon Digital Holdings", sector: "Crypto Mining" },
  { symbol: "CLSK", name: "CleanSpark Inc.", sector: "Crypto Mining" },
  { symbol: "HUT", name: "Hut 8 Corp.", sector: "Crypto Mining" },
  { symbol: "BITF", name: "Bitfarms Ltd.", sector: "Crypto Mining" },
  { symbol: "GLXY", name: "Galaxy Digital", sector: "Crypto / Fintech" },

  // --- ETFs / indices / macro ---
  { symbol: "DIA", name: "SPDR Dow Jones Industrial ETF", sector: "Broad Market" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", sector: "Small Cap Index" },
  { symbol: "VTI", name: "Vanguard Total Stock Market ETF", sector: "Broad Market" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "Broad Market" },
  { symbol: "IVV", name: "iShares Core S&P 500 ETF", sector: "Broad Market" },
  { symbol: "EFA", name: "iShares MSCI EAFE ETF", sector: "Developed Markets" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets ETF", sector: "Emerging Markets" },
  { symbol: "VWO", name: "Vanguard FTSE Emerging Markets ETF", sector: "Emerging Markets" },
  { symbol: "FXI", name: "iShares China Large-Cap ETF", sector: "China Equity" },
  { symbol: "KWEB", name: "KraneShares CSI China Internet ETF", sector: "China Internet" },
  { symbol: "EWJ", name: "iShares MSCI Japan ETF", sector: "Japan Equity" },
  { symbol: "INDA", name: "iShares MSCI India ETF", sector: "India Equity" },
  { symbol: "XLK", name: "Technology Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLV", name: "Health Care Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLI", name: "Industrial Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLY", name: "Consumer Discretionary SPDR", sector: "Sector ETF" },
  { symbol: "XLP", name: "Consumer Staples SPDR", sector: "Sector ETF" },
  { symbol: "XLU", name: "Utilities Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLB", name: "Materials Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLRE", name: "Real Estate Select Sector SPDR", sector: "Sector ETF" },
  { symbol: "XLC", name: "Communication Services SPDR", sector: "Sector ETF" },
  { symbol: "SMH", name: "VanEck Semiconductor ETF", sector: "Sector ETF" },
  { symbol: "SOXX", name: "iShares Semiconductor ETF", sector: "Sector ETF" },
  { symbol: "ARKK", name: "ARK Innovation ETF", sector: "Thematic ETF" },
  { symbol: "TAN", name: "Invesco Solar ETF", sector: "Clean Energy ETF" },
  { symbol: "ICLN", name: "iShares Global Clean Energy ETF", sector: "Clean Energy ETF" },
  { symbol: "LIT", name: "Global X Lithium & Battery Tech ETF", sector: "Thematic ETF" },
  { symbol: "URA", name: "Global X Uranium ETF", sector: "Thematic ETF" },
  { symbol: "JETS", name: "U.S. Global Jets ETF", sector: "Thematic ETF" },
  { symbol: "IBIT", name: "iShares Bitcoin Trust", sector: "Crypto ETF" },
  { symbol: "FBTC", name: "Fidelity Wise Origin Bitcoin Fund", sector: "Crypto ETF" },
  { symbol: "ETHA", name: "iShares Ethereum Trust", sector: "Crypto ETF" },
  { symbol: "GLD", name: "SPDR Gold Shares", sector: "Commodity ETF" },
  { symbol: "SLV", name: "iShares Silver Trust", sector: "Commodity ETF" },
  { symbol: "USO", name: "United States Oil Fund", sector: "Commodity ETF" },
  { symbol: "UNG", name: "United States Natural Gas Fund", sector: "Commodity ETF" },
  { symbol: "DBC", name: "Invesco DB Commodity Index", sector: "Commodity ETF" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", sector: "Bond ETF" },
  { symbol: "IEF", name: "iShares 7-10 Year Treasury Bond ETF", sector: "Bond ETF" },
  { symbol: "SHY", name: "iShares 1-3 Year Treasury Bond ETF", sector: "Bond ETF" },
  { symbol: "HYG", name: "iShares iBoxx High Yield Corp Bond ETF", sector: "Bond ETF" },
  { symbol: "LQD", name: "iShares Investment Grade Corp Bond ETF", sector: "Bond ETF" },
  { symbol: "TIP", name: "iShares TIPS Bond ETF", sector: "Bond ETF" },
  { symbol: "UUP", name: "Invesco DB US Dollar Bullish Fund", sector: "Currency ETF" },
  { symbol: "VXX", name: "iPath Series B S&P 500 VIX Short-Term Futures", sector: "Volatility" },
  { symbol: "UVXY", name: "ProShares Ultra VIX Short-Term Futures", sector: "Volatility" },

  // --- Crypto (spot) ---
  { symbol: "BTC-USD", name: "Bitcoin", sector: "Crypto" },
  { symbol: "ETH-USD", name: "Ethereum", sector: "Crypto" },
  { symbol: "SOL-USD", name: "Solana", sector: "Crypto" },
  { symbol: "BNB-USD", name: "BNB", sector: "Crypto" },
  { symbol: "XRP-USD", name: "XRP", sector: "Crypto" },
  { symbol: "ADA-USD", name: "Cardano", sector: "Crypto" },
  { symbol: "DOGE-USD", name: "Dogecoin", sector: "Crypto" },
  { symbol: "AVAX-USD", name: "Avalanche", sector: "Crypto" },
  { symbol: "LINK-USD", name: "Chainlink", sector: "Crypto" },
  { symbol: "MATIC-USD", name: "Polygon", sector: "Crypto" },
  { symbol: "DOT-USD", name: "Polkadot", sector: "Crypto" },
  { symbol: "LTC-USD", name: "Litecoin", sector: "Crypto" },

  // --- FX & rates proxies ---
  { symbol: "DXY", name: "US Dollar Index", sector: "FX Index" },
  { symbol: "EURUSD=X", name: "Euro / US Dollar", sector: "FX" },
  { symbol: "USDJPY=X", name: "US Dollar / Japanese Yen", sector: "FX" },
  { symbol: "GBPUSD=X", name: "British Pound / US Dollar", sector: "FX" },
  { symbol: "USDCNY=X", name: "US Dollar / Chinese Yuan", sector: "FX" },
  { symbol: "USDCAD=X", name: "US Dollar / Canadian Dollar", sector: "FX" },
  { symbol: "AUDUSD=X", name: "Australian Dollar / US Dollar", sector: "FX" },

  // --- Futures / commodities proxies ---
  { symbol: "CL=F", name: "WTI Crude Oil Futures", sector: "Commodity" },
  { symbol: "BZ=F", name: "Brent Crude Oil Futures", sector: "Commodity" },
  { symbol: "NG=F", name: "Natural Gas Futures", sector: "Commodity" },
  { symbol: "GC=F", name: "Gold Futures", sector: "Commodity" },
  { symbol: "SI=F", name: "Silver Futures", sector: "Commodity" },
  { symbol: "HG=F", name: "Copper Futures", sector: "Commodity" },
  { symbol: "ZC=F", name: "Corn Futures", sector: "Commodity" },
  { symbol: "ZW=F", name: "Wheat Futures", sector: "Commodity" },
  { symbol: "ZS=F", name: "Soybean Futures", sector: "Commodity" },
  { symbol: "KC=F", name: "Coffee Futures", sector: "Commodity" },

  // --- Global indices ---
  { symbol: "^GSPC", name: "S&P 500 Index", sector: "Index" },
  { symbol: "^DJI", name: "Dow Jones Industrial Average", sector: "Index" },
  { symbol: "^IXIC", name: "Nasdaq Composite", sector: "Index" },
  { symbol: "^RUT", name: "Russell 2000", sector: "Index" },
  { symbol: "^VIX", name: "CBOE Volatility Index", sector: "Volatility" },
  { symbol: "^FTSE", name: "FTSE 100", sector: "Index (UK)" },
  { symbol: "^GDAXI", name: "DAX", sector: "Index (Germany)" },
  { symbol: "^FCHI", name: "CAC 40", sector: "Index (France)" },
  { symbol: "^N225", name: "Nikkei 225", sector: "Index (Japan)" },
  { symbol: "^HSI", name: "Hang Seng Index", sector: "Index (HK)" },
  { symbol: "000001.SS", name: "Shanghai Composite", sector: "Index (China)" },
];

function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ALT_DATASETS = [
  { name: "Electricity Demand", category: "Energy" },
  { name: "AI Infrastructure Spending", category: "Technology" },
  { name: "Semiconductor Production", category: "Supply Chain" },
  { name: "Cloud Compute Usage", category: "Technology" },
  { name: "Google Search Trends", category: "Consumer" },
  { name: "GitHub Repo Activity", category: "Technology" },
  { name: "Credit Card Spending", category: "Consumer" },
  { name: "Foot Traffic Index", category: "Consumer" },
  { name: "Container Shipping Rates", category: "Supply Chain" },
  { name: "Port Congestion Index", category: "Supply Chain" },
  { name: "Rail Freight Volume", category: "Supply Chain" },
  { name: "Nighttime Light Intensity", category: "Geospatial" },
  { name: "Parking Lot Occupancy", category: "Geospatial" },
  { name: "Construction Activity (SAR)", category: "Geospatial" },
  { name: "US 10Y Treasury Yield", category: "Macro" },
  { name: "CPI ex-Food & Energy", category: "Macro" },
  { name: "ISM Manufacturing PMI", category: "Macro" },
  { name: "Consumer Confidence", category: "Macro" },
  { name: "Weather Anomaly Index", category: "Environmental" },
  { name: "Job Postings — AI/ML", category: "Technology" },
  { name: "Mobile App Downloads", category: "Consumer" },
  { name: "Package Downloads (npm)", category: "Technology" },
];

const REGIMES = [
  "Technology Expansion",
  "Late-Cycle Consolidation",
  "Risk-Off Rotation",
  "Reflation",
  "Rate-Cut Cycle",
  "Volatility Compression",
];

const RELATIONSHIP_TYPES = [
  "Direct Fundamental Relationship",
  "Indirect Fundamental Relationship",
  "Shared Macro Sensitivity",
  "Supply-Chain Coupled",
  "Behavioral / Flow-Driven",
];

export type Analysis = ReturnType<typeof buildAnalysis>;

export function buildAnalysis(a: Asset, b: Asset, salt = 0) {
  const seed = hash(`${a.symbol}|${b.symbol}|${salt}`);
  const rnd = mulberry(seed);

  const strength = 0.55 + rnd() * 0.44;
  const confidence = 0.6 + rnd() * 0.38;
  const stability = 0.5 + rnd() * 0.48;
  const forecastConf = 0.6 + rnd() * 0.35;
  const leadDays = Math.round((rnd() - 0.3) * 22);
  const regime = REGIMES[Math.floor(rnd() * REGIMES.length)];
  const relType = RELATIONSHIP_TYPES[Math.floor(rnd() * RELATIONSHIP_TYPES.length)];

  // Ranked alt datasets
  const shuffled = [...ALT_DATASETS]
    .map((d) => ({ ...d, importance: rnd() }))
    .sort((x, y) => y.importance - x.importance)
    .slice(0, 8)
    .map((d, i) => ({
      ...d,
      importance: Math.max(0.28, 1 - i * 0.08 - rnd() * 0.06),
    }));

  const primaryDrivers = shuffled.slice(0, 3).map((d) => d.name);

  // DNA decomposition (weights sum ~ 1)
  const dnaRaw = [rnd(), rnd(), rnd(), rnd(), rnd()];
  const dnaSum = dnaRaw.reduce((s, x) => s + x, 0);
  const dna = [
    { name: "Fundamental",     value: dnaRaw[0] / dnaSum, color: "var(--dna-1)", desc: "Shared business drivers, revenue exposure, product overlap." },
    { name: "Macroeconomic",   value: dnaRaw[1] / dnaSum, color: "var(--dna-2)", desc: "Common sensitivity to rates, inflation, and growth cycles." },
    { name: "Alternative Data",value: dnaRaw[2] / dnaSum, color: "var(--dna-3)", desc: "Co-movement in real-world signals: energy, shipping, web activity." },
    { name: "Behavioral",      value: dnaRaw[3] / dnaSum, color: "var(--dna-4)", desc: "Investor positioning, sentiment, and flow-driven coupling." },
    { name: "Market",          value: dnaRaw[4] / dnaSum, color: "var(--dna-5)", desc: "Price, volatility, and factor-loading similarity." },
  ];

  // 24-month relationship evolution
  const timeline: { t: string; rho: number; ci_lo: number; ci_hi: number }[] = [];
  let rho = strength * 0.7 + (rnd() - 0.5) * 0.1;
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    rho = Math.max(-0.1, Math.min(0.99, rho + (strength - rho) * 0.18 + (rnd() - 0.5) * 0.08));
    const band = 0.05 + rnd() * 0.06;
    timeline.push({
      t: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      rho: +rho.toFixed(3),
      ci_lo: +(rho - band).toFixed(3),
      ci_hi: +(rho + band).toFixed(3),
    });
  }

  // 90-day forecast fan (Monte Carlo relationship strength paths)
  const horizon = 90;
  const paths = 80;
  const startRho = timeline[timeline.length - 1].rho;
  const fan: { day: number; p10: number; p25: number; p50: number; p75: number; p90: number }[] = [];
  const drift = (strength - startRho) * 0.012;
  const vol = 0.018 + (1 - stability) * 0.02;
  const simEnd: number[] = [];
  for (let d = 0; d <= horizon; d++) {
    const samples: number[] = [];
    for (let p = 0; p < paths; p++) {
      const r = mulberry(seed ^ (p * 7919) ^ d);
      let v = startRho;
      for (let k = 0; k <= d; k++) {
        v += drift + (r() - 0.5) * vol;
        v = Math.max(-0.05, Math.min(0.99, v));
      }
      samples.push(v);
      if (d === horizon) simEnd.push(v);
    }
    samples.sort((x, y) => x - y);
    fan.push({
      day: d,
      p10: +samples[Math.floor(paths * 0.1)].toFixed(3),
      p25: +samples[Math.floor(paths * 0.25)].toFixed(3),
      p50: +samples[Math.floor(paths * 0.5)].toFixed(3),
      p75: +samples[Math.floor(paths * 0.75)].toFixed(3),
      p90: +samples[Math.floor(paths * 0.9)].toFixed(3),
    });
  }

  const pStrengthen = simEnd.filter((v) => v > startRho + 0.02).length / simEnd.length;
  const pWeaken = simEnd.filter((v) => v < startRho - 0.02).length / simEnd.length;
  const pBreak = simEnd.filter((v) => v < 0.25).length / simEnd.length;

  // Statistical validation tests
  const tests = [
    { name: "Pearson Correlation",    value: strength,                       p: 0.001,  passes: true,  desc: "Linear co-movement of daily log returns over trailing 5y." },
    { name: "Rolling 60d Correlation",value: strength - 0.05 + rnd() * 0.05, p: 0.003,  passes: true,  desc: "Stability of correlation across a rolling 60-day window." },
    { name: "Cointegration (Engle-Granger)", value: 0.7 + rnd() * 0.25, p: 0.008,  passes: rnd() > 0.3, desc: "Long-run equilibrium relationship between price series." },
    { name: "Granger Causality (A→B)",value: 0.55 + rnd() * 0.4,             p: 0.02,   passes: leadDays > 0, desc: "Whether A's history helps predict B beyond B's own history." },
    { name: "Mutual Information",     value: 0.4 + rnd() * 0.5,              p: NaN,    passes: true,  desc: "Non-linear dependence, capturing structure Pearson misses." },
    { name: "Transfer Entropy",       value: 0.3 + rnd() * 0.4,              p: NaN,    passes: leadDays !== 0, desc: "Directional information flow from one series into the other." },
    { name: "ADF Stationarity",       value: 0.65 + rnd() * 0.25,            p: 0.04,   passes: true,  desc: "Residual stationarity test on the pair spread." },
    { name: "KPSS Test",              value: 0.6 + rnd() * 0.25,             p: 0.05,   passes: rnd() > 0.4, desc: "Complement to ADF for confirming stationarity." },
    { name: "Bootstrap Validation",   value: 0.72 + rnd() * 0.2,             p: 0.005,  passes: true,  desc: "1000-draw bootstrap resample confidence on the estimate." },
    { name: "Out-of-Sample R²",       value: 0.35 + rnd() * 0.4,             p: NaN,    passes: true,  desc: "Predictive power held out on the last 20% of the sample." },
  ];

  // Model comparison
  const models = [
    { name: "Bayesian Updating",    forecast: strength + 0.02, conf: forecastConf,       accuracy: 0.72, note: "Handles regime shifts; slow to react to shocks." },
    { name: "Kalman Filter",        forecast: strength + 0.01, conf: forecastConf - 0.03,accuracy: 0.75, note: "Smooth state estimates for time-varying correlation." },
    { name: "ARIMA(2,0,2)",         forecast: strength - 0.02, conf: forecastConf - 0.08,accuracy: 0.63, note: "Baseline linear model; weak with regime change." },
    { name: "VAR(4)",               forecast: strength + 0.03, conf: forecastConf - 0.05,accuracy: 0.69, note: "Captures cross-series feedback and lead-lag." },
    { name: "Random Forest",        forecast: strength + 0.04, conf: forecastConf - 0.02,accuracy: 0.77, note: "Non-linear, robust to noisy alt-data features." },
    { name: "Gradient Boosting",    forecast: strength + 0.03, conf: forecastConf - 0.01,accuracy: 0.79, note: "Strong tabular performance; some overfit risk." },
    { name: "XGBoost",              forecast: strength + 0.05, conf: forecastConf,       accuracy: 0.81, note: "Best in-sample; requires careful CV." },
    { name: "LSTM (64)",            forecast: strength + 0.02, conf: forecastConf - 0.04,accuracy: 0.74, note: "Sequence memory; sensitive to sample size." },
    { name: "Monte Carlo Ensemble", forecast: strength + 0.03, conf: forecastConf + 0.02,accuracy: 0.78, note: "Distributional view rather than point estimate." },
  ];

  // Lead-lag cross correlation profile
  const leadLag: { lag: number; cc: number }[] = [];
  for (let l = -20; l <= 20; l++) {
    const dist = Math.abs(l - leadDays);
    leadLag.push({ lag: l, cc: +Math.max(0, strength - dist * 0.028 - rnd() * 0.05).toFixed(3) });
  }

  return {
    a, b, salt, seed,
    strength, confidence, stability, forecastConf,
    leadDays, regime, relType,
    primaryDrivers,
    altDatasets: shuffled,
    dna,
    timeline,
    fan,
    forecast: {
      trend: pStrengthen > 0.55 ? "Likely Strengthening" : pWeaken > 0.55 ? "Likely Weakening" : "Range-Bound",
      outlook30: pStrengthen > 0.5 ? "Stable → Firming" : "Stable",
      outlook90: pStrengthen > 0.55 ? "Moderately Strengthening" : pWeaken > 0.55 ? "Softening" : "Range-Bound",
      pStrengthen, pWeaken, pBreak,
      expectedLifetimeMonths: Math.round(6 + stability * 30),
      momentum: pStrengthen - pWeaken,
    },
    tests,
    models,
    leadLag,
    updatedAt: new Date().toISOString(),
  };
}

export function buildRankings(count = 12) {
  const pairs: { a: Asset; b: Asset }[] = [
    { a: ASSETS[0], b: ASSETS[8] },     // NVDA / TSM
    { a: ASSETS[7], b: ASSETS[0] },     // AMD / NVDA
    { a: ASSETS[12], b: ASSETS[13] },   // XOM / CVX
    { a: ASSETS[16], b: ASSETS[17] },   // V / MA
    { a: ASSETS[10], b: ASSETS[11] },   // JPM / GS
    { a: ASSETS[14], b: ASSETS[15] },   // COST / WMT
    { a: ASSETS[0], b: ASSETS[23] },    // NVDA / QQQ
    { a: ASSETS[6], b: ASSETS[0] },     // TSLA / NVDA
    { a: ASSETS[2], b: ASSETS[3] },     // MSFT / GOOGL
    { a: ASSETS[1], b: ASSETS[2] },     // AAPL / MSFT
    { a: ASSETS[20], b: ASSETS[0] },    // PLTR / NVDA
    { a: ASSETS[21], b: ASSETS[23] },   // COIN / QQQ
  ].slice(0, count);
  return pairs
    .map((p, i) => {
      const A = buildAnalysis(p.a, p.b, i);
      const trend = A.forecast.momentum > 0.05 ? "up" : A.forecast.momentum < -0.05 ? "down" : "flat";
      return {
        pair: `${p.a.symbol} / ${p.b.symbol}`,
        aSym: p.a.symbol, bSym: p.b.symbol,
        strength: A.strength, forecastConf: A.forecastConf,
        stability: A.stability, regime: A.regime,
        status: A.forecast.trend, trend,
        updated: A.updatedAt,
      };
    })
    .sort((x, y) => y.strength - x.strength);
}

export function fmtPct(v: number, digits = 0) {
  return `${(v * 100).toFixed(digits)}%`;
}
