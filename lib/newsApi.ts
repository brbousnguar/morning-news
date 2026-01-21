import axios from 'axios'
import { fetchGoogleNews } from './googleNews'

export interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
  category: string
}

// ⚠️ WARNING: This API key will be exposed in the browser when deployed to GitHub Pages
// Consider using environment variables or a proxy service for production
const NEWS_API_KEY = '3824959d121f4b72b437e5c98f919c7d'

const COUNTRY_NAMES: { [key: string]: string } = {
  FR: 'france',
  MA: 'morocco',
  US: 'united states',
  GB: 'united kingdom',
  DE: 'germany',
  ES: 'spain',
  IT: 'italy',
  PT: 'portugal',
  BE: 'belgium',
  NL: 'netherlands',
  CH: 'switzerland',
  AT: 'austria',
  CA: 'canada',
  AU: 'australia',
  JP: 'japan',
  CN: 'china',
  IN: 'india',
  BR: 'brazil',
  MX: 'mexico',
  AR: 'argentina',
  EG: 'egypt',
  ZA: 'south africa',
  NG: 'nigeria',
  KE: 'kenya',
  IL: 'israel', // Important: IL is Israel, not Illinois!
  RU: 'russia',
  TR: 'turkey',
  SA: 'saudi arabia',
  AE: 'united arab emirates',
  IQ: 'iraq',
  IR: 'iran',
  PK: 'pakistan',
  BD: 'bangladesh',
  VN: 'vietnam',
  TH: 'thailand',
  ID: 'indonesia',
  PH: 'philippines',
  MY: 'malaysia',
  SG: 'singapore',
  NZ: 'new zealand',
  KR: 'south korea',
  NO: 'norway',
  SE: 'sweden',
  DK: 'denmark',
  FI: 'finland',
  PL: 'poland',
  GR: 'greece',
  IE: 'ireland',
  CZ: 'czech republic',
  RO: 'romania',
  HU: 'hungary',
  SK: 'slovakia',
}

const NEWS_CATEGORIES = [
  'politics',
  'technology',
  'environment',
  'culture',
  'history',
  'archaeology',
]

// Positive keywords to filter news
const POSITIVE_KEYWORDS = [
  'achievement',
  'success',
  'innovation',
  'breakthrough',
  'progress',
  'development',
  'growth',
  'improvement',
  'discovery',
  'celebration',
  'milestone',
  'advancement',
  'partnership',
  'collaboration',
  'award',
  'recognition',
  'launch',
  'unveil',
  'announce',
  'initiative',
  'opens',
  'inaugurates',
  'celebrates',
  'wins',
  'achieves',
]

// Negative keywords to exclude
const NEGATIVE_KEYWORDS = [
  'crisis',
  'war',
  'attack',
  'death',
  'killed',
  'violence',
  'conflict',
  'disaster',
  'accident',
  'scandal',
  'corruption',
  'protest',
  'strike',
  'unrest',
  'dies',
  'murder',
  'bomb',
  'terror',
]

// IT domain keywords
const IT_KEYWORDS = [
  'mulesoft',
  'sap commerce cloud',
  'life in france',
  'french tech',
  'digital transformation',
  'software',
  'technology',
]

// French news domains
const FRENCH_DOMAINS = [
  'lemonde.fr',
  'france24.com',
  'rfi.fr',
  'lefigaro.fr',
  'liberation.fr',
  'leparisien.fr',
  'lesechos.fr',
  'franceinfo.fr',
  'bfmtv.com',
  'lexpress.fr',
  'lepoint.fr',
  'marianne.net',
  'nouvelobs.com',
  'rtl.fr',
  'europe1.fr',
  'franceinter.fr',
  'radiofrance.fr',
  'tv5monde.org',
  'jeuneafrique.com',
  'hebdo.ch',
  '20minutes.fr',
  'lci.fr',
  'francebleu.fr',
]

function categorizeArticle(title: string, description: string, language: string = 'en'): string {
  const text = `${title} ${description}`.toLowerCase()
  const isFrench = language === 'fr'

  // Check IT domain first
  if (IT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 'IT Domain'
  }

  // Politics keywords (French and English)
  const politicsKeywords = isFrench 
    ? ['politique', 'gouvernement', 'ministre', 'président', 'parlement', 'élection', 'parti', 'roi', 'monarchie', 'trump', 'biden']
    : ['politic', 'government', 'minister', 'president', 'parliament', 'election', 'party', 'king', 'monarchy']
  
  // Technology keywords
  const techKeywords = isFrench
    ? ['technologie', 'techno', 'digital', 'informatique', 'innovation', 'startup', 'ia', 'intelligence artificielle']
    : ['tech', 'digital', 'software', 'ai', 'innovation', 'startup', 'computer', 'internet']
  
  // Environment keywords
  const envKeywords = isFrench
    ? ['environnement', 'climat', 'écologie', 'vert', 'renouvelable', 'durable', 'solaire', 'éolien']
    : ['environment', 'climate', 'green', 'renewable', 'sustainability', 'solar', 'wind']
  
  // Culture keywords (including sports)
  const cultureKeywords = isFrench
    ? ['culture', 'art', 'musique', 'festival', 'patrimoine', 'cinéma', 'théâtre', 'littérature', 'football', 'sport', 'can', 'championnat', 'match', 'équipe', 'joueur', 'ultras']
    : ['culture', 'art', 'music', 'festival', 'heritage', 'cinema', 'theater', 'literature', 'football', 'sport']
  
  // History & Archaeology keywords
  const historyKeywords = isFrench
    ? ['histoire', 'archéologie', 'découverte', 'ancien', 'historique', 'archéologique']
    : ['history', 'archaeology', 'discovery', 'ancient', 'historical', 'archaeological']

  // Check categories in order
  if (politicsKeywords.some(keyword => text.includes(keyword))) {
    return 'Politics'
  }
  if (techKeywords.some(keyword => text.includes(keyword))) {
    return 'Technology'
  }
  if (envKeywords.some(keyword => text.includes(keyword))) {
    return 'Environment'
  }
  if (cultureKeywords.some(keyword => text.includes(keyword))) {
    return 'Culture'
  }
  if (historyKeywords.some(keyword => text.includes(keyword))) {
    return 'History & Archaeology'
  }

  return 'General'
}

// Mock news data generator for demonstration
// In production, replace this with actual NewsAPI calls
async function fetchMockNews(countryCode: string): Promise<NewsArticle[]> {
  const countryName = COUNTRY_NAMES[countryCode] || 'world'
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockArticles: NewsArticle[] = [
    {
      title: `${countryName.charAt(0).toUpperCase() + countryName.slice(1)} announces major renewable energy initiative`,
      description: `A groundbreaking renewable energy project has been launched, marking a significant step towards sustainability and environmental protection.`,
      url: `https://example.com/news/${countryCode}-renewable-energy`,
      urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
      publishedAt: new Date().toISOString(),
      source: { name: 'Tech News' },
      category: 'Environment',
    },
    {
      title: `New technology breakthrough in ${countryName}`,
      description: `Scientists and engineers have achieved a major technological advancement that promises to revolutionize the industry.`,
      url: `https://example.com/news/${countryCode}-tech-breakthrough`,
      urlToImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: 'Science Daily' },
      category: 'Technology',
    },
    {
      title: `Cultural festival celebrates ${countryName}'s rich heritage`,
      description: `A vibrant cultural festival showcasing traditional arts, music, and cuisine has brought communities together in celebration.`,
      url: `https://example.com/news/${countryCode}-culture-festival`,
      urlToImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: 'Culture Today' },
      category: 'Culture',
    },
    {
      title: `Archaeological discovery reveals ancient history in ${countryName}`,
      description: `A remarkable archaeological find has uncovered new insights into the region's ancient past, exciting historians worldwide.`,
      url: `https://example.com/news/${countryCode}-archaeology`,
      urlToImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
      publishedAt: new Date(Date.now() - 259200000).toISOString(),
      source: { name: 'History Channel' },
      category: 'History & Archaeology',
    },
    {
      title: `Digital transformation initiative launched in ${countryName}`,
      description: `A comprehensive digital transformation program aims to modernize public services and improve citizen experience.`,
      url: `https://example.com/news/${countryCode}-digital-transformation`,
      urlToImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      publishedAt: new Date(Date.now() - 345600000).toISOString(),
      source: { name: 'Tech Weekly' },
      category: 'IT Domain',
    },
    {
      title: `International partnership strengthens ${countryName}'s economy`,
      description: `A new international collaboration agreement promises economic growth and job creation opportunities.`,
      url: `https://example.com/news/${countryCode}-partnership`,
      urlToImage: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800',
      publishedAt: new Date(Date.now() - 432000000).toISOString(),
      source: { name: 'Business News' },
      category: 'Politics',
    },
    {
      title: `Innovation hub opens in ${countryName}`,
      description: `A state-of-the-art innovation center has opened its doors, providing space for startups and tech companies to thrive.`,
      url: `https://example.com/news/${countryCode}-innovation-hub`,
      urlToImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      publishedAt: new Date(Date.now() - 518400000).toISOString(),
      source: { name: 'Innovation Today' },
      category: 'Technology',
    },
    {
      title: `Sustainable agriculture program benefits ${countryName}`,
      description: `An innovative sustainable agriculture initiative is helping farmers increase yields while protecting the environment.`,
      url: `https://example.com/news/${countryCode}-sustainable-agriculture`,
      urlToImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
      publishedAt: new Date(Date.now() - 604800000).toISOString(),
      source: { name: 'Green News' },
      category: 'Environment',
    },
  ]

  return mockArticles
}

// Client-side cache (localStorage)
const CLIENT_CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function getClientCacheKey(countryCode: string, language: string): string {
  return `news_cache_${countryCode}_${language}`
}

function getCachedClientData(countryCode: string, language: string): NewsArticle[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cacheKey = getClientCacheKey(countryCode, language)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    
    // Check if cache is still valid
    if (Date.now() - timestamp > CLIENT_CACHE_DURATION) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    // Check if cached data is mock data or incorrect (has example.com URLs or wrong country) - clear it
    if (data && Array.isArray(data) && data.length > 0) {
      const isMockData = data.some((article: any) => 
        article.url && article.url.includes('example.com')
      )
      
      // Special check for Israel - if we see Illinois-related articles, clear cache
      if (countryCode === 'IL') {
        const hasIllinoisNews = data.some((article: any) => {
          const text = `${article.title} ${article.description}`.toLowerCase()
          return text.includes('illinois') || text.includes('chicago') || text.includes('springfield')
        })
        
        if (hasIllinoisNews) {
          console.log(`Clearing incorrect Illinois data from cache for Israel (IL)`)
          localStorage.removeItem(cacheKey)
          return null
        }
      }
      
      if (isMockData) {
        console.log(`Clearing mock data from client cache for ${countryCode}`)
        localStorage.removeItem(cacheKey)
        return null
      }
    }
    
    return data
  } catch {
    return null
  }
}

function setCachedClientData(countryCode: string, language: string, data: NewsArticle[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheKey = getClientCacheKey(countryCode, language)
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now(),
    }))
  } catch {
    // Ignore localStorage errors
  }
}

export async function fetchCountryNews(countryCode: string, language: string = 'en'): Promise<NewsArticle[]> {
  // Check client-side cache first
  const cachedData = getCachedClientData(countryCode, language)
  if (cachedData) {
    console.log(`Client cache hit for ${countryCode} (${language})`)
    return cachedData
  }

  // Get country name - handle special cases
  let countryName = COUNTRY_NAMES[countryCode.toUpperCase()]
  if (!countryName) {
    // Special handling for IL - it's Israel, not Illinois
    if (countryCode.toUpperCase() === 'IL') {
      countryName = 'israel'
    } else {
      countryName = countryCode.toLowerCase()
    }
  }
  const newsLanguage = language === 'fr' ? 'fr' : 'en'
  
  console.log(`Fetching news for ${countryCode} -> ${countryName} (${newsLanguage})`)

  try {
    const allArticles: any[] = []

    if (newsLanguage === 'fr') {
      // NewsAPI free tier only supports /top-headlines, not /everything
      // Map country code to ISO 3166-1 alpha-2 code for NewsAPI
      const countryCodeMap: { [key: string]: string } = {
        'france': 'fr',
        'morocco': 'ma',
        'united states': 'us',
        'united kingdom': 'gb',
        'germany': 'de',
        'spain': 'es',
        'italy': 'it',
        'portugal': 'pt',
        'belgium': 'be',
        'netherlands': 'nl',
        'switzerland': 'ch',
        'austria': 'at',
        'canada': 'ca',
        'australia': 'au',
        'japan': 'jp',
        'china': 'cn',
        'india': 'in',
        'brazil': 'br',
        'mexico': 'mx',
        'argentina': 'ar',
        'egypt': 'eg',
        'south africa': 'za',
        'nigeria': 'ng',
        'kenya': 'ke',
        'israel': 'il',
        'russia': 'ru',
        'turkey': 'tr',
        'saudi arabia': 'sa',
        'united arab emirates': 'ae',
        'iraq': 'iq',
        'iran': 'ir',
        'pakistan': 'pk',
        'bangladesh': 'bd',
        'vietnam': 'vn',
        'thailand': 'th',
        'indonesia': 'id',
        'philippines': 'ph',
        'malaysia': 'my',
        'singapore': 'sg',
        'new zealand': 'nz',
        'south korea': 'kr',
        'norway': 'no',
        'sweden': 'se',
        'denmark': 'dk',
        'finland': 'fi',
        'poland': 'pl',
        'greece': 'gr',
        'ireland': 'ie',
        'czech republic': 'cz',
        'romania': 'ro',
        'hungary': 'hu',
        'slovakia': 'sk',
      }
      
      const apiCountryCode = countryCodeMap[countryName.toLowerCase()] || countryCode.toLowerCase()
      
      try {
        const params: any = {
          country: apiCountryCode,
          language: 'fr',
          pageSize: 50,
          apiKey: NEWS_API_KEY,
        }

        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params,
        }).catch((error: any) => {
          // Handle 426 Upgrade Required (free tier limitation)
          if (error.response?.status === 426) {
            console.warn('NewsAPI 426: Free tier limitation. Falling back to Google News.')
            throw new Error('UPGRADE_REQUIRED')
          }
          // Handle rate limiting
          if (error.response?.status === 429) {
            throw new Error('RATE_LIMITED')
          }
          throw error
        })

        if (response.data.status === 'error') {
          console.error(`NewsAPI error: ${response.data.message}`)
          if (response.data.code === 'rateLimited') {
            throw new Error('RATE_LIMITED')
          }
          if (response.data.code === 'upgradeRequired') {
            throw new Error('UPGRADE_REQUIRED')
          }
        }

        if (response.data.articles) {
          allArticles.push(...response.data.articles)
        }
      } catch (error: any) {
        if (error.message === 'RATE_LIMITED' || error.message === 'UPGRADE_REQUIRED') {
          throw error
        }
        console.error(`Error fetching French news:`, error.message)
      }
    } else {
      // English news - use /top-headlines for free tier
      const countryCodeMap: { [key: string]: string } = {
        'france': 'fr',
        'morocco': 'ma',
        'united states': 'us',
        'united kingdom': 'gb',
        'germany': 'de',
        'spain': 'es',
        'italy': 'it',
        'portugal': 'pt',
        'belgium': 'be',
        'netherlands': 'nl',
        'switzerland': 'ch',
        'austria': 'at',
        'canada': 'ca',
        'australia': 'au',
        'japan': 'jp',
        'china': 'cn',
        'india': 'in',
        'brazil': 'br',
        'mexico': 'mx',
        'argentina': 'ar',
        'egypt': 'eg',
        'south africa': 'za',
        'nigeria': 'ng',
        'kenya': 'ke',
        'israel': 'il',
        'russia': 'ru',
        'turkey': 'tr',
        'saudi arabia': 'sa',
        'united arab emirates': 'ae',
        'iraq': 'iq',
        'iran': 'ir',
        'pakistan': 'pk',
        'bangladesh': 'bd',
        'vietnam': 'vn',
        'thailand': 'th',
        'indonesia': 'id',
        'philippines': 'ph',
        'malaysia': 'my',
        'singapore': 'sg',
        'new zealand': 'nz',
        'south korea': 'kr',
        'norway': 'no',
        'sweden': 'se',
        'denmark': 'dk',
        'finland': 'fi',
        'poland': 'pl',
        'greece': 'gr',
        'ireland': 'ie',
        'czech republic': 'cz',
        'romania': 'ro',
        'hungary': 'hu',
        'slovakia': 'sk',
      }
      
      const apiCountryCode = countryCodeMap[countryName.toLowerCase()] || countryCode.toLowerCase()
      
      try {
        const params: any = {
          country: apiCountryCode,
          language: 'en',
          pageSize: 50,
          apiKey: NEWS_API_KEY,
        }

        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
          params,
        }).catch((error: any) => {
          // Handle 426 Upgrade Required (free tier limitation)
          if (error.response?.status === 426) {
            console.warn('NewsAPI 426: Free tier limitation. Falling back to Google News.')
            throw new Error('UPGRADE_REQUIRED')
          }
          // Handle rate limiting
          if (error.response?.status === 429) {
            throw new Error('RATE_LIMITED')
          }
          throw error
        })

        if (response.data.status === 'error') {
          console.error(`NewsAPI error: ${response.data.message}`)
          if (response.data.code === 'rateLimited') {
            throw new Error('RATE_LIMITED')
          }
          if (response.data.code === 'upgradeRequired') {
            throw new Error('UPGRADE_REQUIRED')
          }
        }

        if (response.data.articles) {
          allArticles.push(...response.data.articles)
        }
      } catch (error: any) {
        if (error.message === 'RATE_LIMITED' || error.message === 'UPGRADE_REQUIRED') {
          throw error
        }
        console.error(`Error fetching news:`, error.message)
      }
    }

    // Remove duplicates based on URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    )

    // Filter for positive news and categorize
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    let filteredArticles = uniqueArticles
      .filter(
        (article: any) => {
          const hasContent = article.title && article.description && article.url
          if (!hasContent) return false
          
          // Filter by date - only show articles from last 7 days
          if (article.publishedAt) {
            const articleDate = new Date(article.publishedAt)
            if (isNaN(articleDate.getTime()) || articleDate < sevenDaysAgo) {
              return false
            }
          }
          
          const text = `${article.title} ${article.description}`.toLowerCase()
          
          // Special check: If country is Israel (IL), exclude Illinois articles
          if (countryCode.toUpperCase() === 'IL') {
            if (text.includes('illinois') || text.includes('chicago') || text.includes('springfield') || 
                text.includes('state of illinois') || text.includes('il state')) {
              console.log(`Filtered out Illinois article for Israel: ${article.title}`)
              return false
            }
            // Prefer articles that mention Israel
            if (!text.includes('israel') && !text.includes('israeli') && !text.includes('jerusalem') && 
                !text.includes('tel aviv') && !text.includes('gaza') && !text.includes('west bank')) {
              console.log(`Article doesn't mention Israel: ${article.title}`)
              return false
            }
          }
          
          // If French is selected, STRICTLY only include articles from French domains
          if (newsLanguage === 'fr') {
            const url = (article.url || '').toLowerCase()
            const sourceName = (article.source?.name || '').toLowerCase()
            
            const isFromFrenchDomain = FRENCH_DOMAINS.some(domain => url.includes(domain))
            
            const isFrenchSource = FRENCH_DOMAINS.some(domain => {
              const domainName = domain.replace('.fr', '').replace('.com', '').replace('.org', '').replace('.net', '').replace('.ch', '')
              return sourceName.includes(domainName)
            })
            
            if (!isFromFrenchDomain && !isFrenchSource) {
              console.log(`Filtered out non-French article: ${url} from ${sourceName}`)
              return false
            }
          }
          
          // Check for negative keywords - exclude those
          const hasNegative = NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))
          
          if (hasNegative) {
            return false
          }
          
          // For NewsAPI, prefer articles with positive keywords, but be lenient
          const hasPositive = POSITIVE_KEYWORDS.some((keyword) => text.includes(keyword))
          
          // If we have few articles, be more lenient - allow articles without negative keywords
          if (uniqueArticles.length < 10) {
            return true // Allow if no negative keywords
          }
          
          return hasPositive
        }
      )
      .map((article: any) => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || 'Unknown',
        },
        category: categorizeArticle(article.title, article.description || '', newsLanguage),
      }))
      // Sort by date - newest first
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt).getTime()
        const dateB = new Date(b.publishedAt).getTime()
        return dateB - dateA // Descending order (newest first)
      })
      .slice(0, 8)

    // If we don't have enough articles, try Google News as fallback
    if (filteredArticles.length === 0) {
      console.log(`No articles from NewsAPI, trying Google News RSS fallback for ${countryName}...`)
      try {
        const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
        
        if (googleNewsArticles.length > 0) {
          setCachedClientData(countryCode, language, googleNewsArticles)
          console.log(`✅ Fetched ${googleNewsArticles.length} articles from Google News`)
          return googleNewsArticles
        }
      } catch (googleError: any) {
        console.error('Error fetching Google News:', googleError.message)
      }
      
      return []
    }

    const result = filteredArticles.slice(0, 8)
    
    // Cache the result
    setCachedClientData(countryCode, language, result)
    console.log(`Cached ${result.length} articles for ${countryCode} (${newsLanguage})`)
    
    return result
  } catch (error: any) {
    console.error('Error fetching news:', error.message)
    
    if (error.message === 'RATE_LIMITED' || error.message === 'UPGRADE_REQUIRED') {
      // Fallback to Google News RSS when NewsAPI is rate-limited or requires upgrade
      console.log(`NewsAPI ${error.message === 'UPGRADE_REQUIRED' ? 'requires upgrade' : 'rate limited'}, falling back to Google News RSS...`)
      try {
        const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
        
        if (googleNewsArticles.length > 0) {
          setCachedClientData(countryCode, language, googleNewsArticles)
          console.log(`Fetched ${googleNewsArticles.length} articles from Google News`)
          return googleNewsArticles
        }
      } catch (googleError: any) {
        console.error('Error fetching Google News:', googleError.message)
      }
      
      return []
    }
    
    // If other error, try Google News as fallback
    console.log('NewsAPI error, trying Google News RSS as fallback...')
    try {
      const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
      
      if (googleNewsArticles.length > 0) {
        setCachedClientData(countryCode, language, googleNewsArticles)
        return googleNewsArticles
      }
    } catch (googleError: any) {
      console.error('Error fetching Google News:', googleError.message)
    }
    
    return []
  }
}
