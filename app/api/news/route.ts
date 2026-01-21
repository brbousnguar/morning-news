import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getCacheKey, getCached, setCache, clearCacheForCountry } from '@/lib/cache'
import { fetchGoogleNews } from '@/lib/googleNews'

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
  'killed',
  'dies',
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

function isPositiveNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()

  // Check for negative keywords first - exclude if found
  if (NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return false
  }

  // For NewsAPI, check for positive keywords
  // For Google News RSS, we'll be more lenient (handled in googleNews.ts)
  return POSITIVE_KEYWORDS.some((keyword) => text.includes(keyword))
}

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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const countryCode = searchParams.get('country')
  const language = searchParams.get('language') || 'en'

  if (!countryCode) {
    return NextResponse.json({ error: 'Country code is required' }, { status: 400 })
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

  // Check cache first (but skip if it's an empty array - we want to retry)
  const cacheKey = getCacheKey(countryCode, newsLanguage)
  const cachedData = getCached(cacheKey)
  
  // Check if cached data looks like mock data (has "example.com" URLs)
  const isMockData = cachedData && Array.isArray(cachedData) && cachedData.length > 0 && 
    cachedData.some((article: any) => article.url && article.url.includes('example.com'))
  
  if (cachedData && Array.isArray(cachedData) && cachedData.length > 0 && !isMockData) {
    console.log(`Cache hit for ${countryCode} (${newsLanguage})`)
    return NextResponse.json(cachedData)
  }
  
  // If we have mock data cached, clear it and fetch fresh
  if (isMockData) {
    console.log(`Clearing mock data cache for ${countryCode} (${newsLanguage}), fetching fresh...`)
    clearCacheForCountry(countryCode, newsLanguage)
  }

  try {
    const allArticles: any[] = []

    if (newsLanguage === 'fr') {
      // OPTIMIZED: Use a single broader query with multiple French domains
      // Instead of 8 domains × 3 queries = 24 calls, use 1-2 calls max
      const domains = FRENCH_DOMAINS.slice(0, 5).join(',') // Limit to 5 domains
      
      // Single comprehensive query
      const query = countryName
      
      try {
        // Filter by date - only show articles from last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const fromDate = sevenDaysAgo.toISOString().split('T')[0] // Format: YYYY-MM-DD

        const params: any = {
          q: query,
          language: 'fr',
          domains: domains,
          sortBy: 'publishedAt',
          pageSize: 50, // Get more articles in one call
          from: fromDate, // Only get articles from last 7 days
          apiKey: NEWS_API_KEY,
        }

        const response = await axios.get('https://newsapi.org/v2/everything', {
          params,
        })

        // Check for rate limiting or errors
        if (response.data.status === 'error') {
          console.error(`NewsAPI error: ${response.data.message}`)
          if (response.data.code === 'rateLimited') {
            throw new Error('RATE_LIMITED')
          }
        }

        if (response.data.articles) {
          allArticles.push(...response.data.articles)
        }
      } catch (error: any) {
        if (error.message === 'RATE_LIMITED') {
          throw error
        }
        console.error(`Error fetching French news:`, error.message)
      }
    } else {
      // OPTIMIZED: Use a single broader query instead of 6 separate queries
      // Combine all categories into one query
      // Filter by date - only show articles from last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const fromDate = sevenDaysAgo.toISOString().split('T')[0] // Format: YYYY-MM-DD
      
      const query = `${countryName} AND (technology OR innovation OR startup OR environment OR climate OR renewable OR culture OR art OR music OR festival OR politics OR government OR history OR archaeology OR discovery OR mulesoft OR "sap commerce" OR "french tech")`
      
      try {
        const params: any = {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 50, // Get more articles in one call
          from: fromDate, // Only get articles from last 7 days
          apiKey: NEWS_API_KEY,
        }

        const response = await axios.get('https://newsapi.org/v2/everything', {
          params,
        })

        // Check for rate limiting or errors
        if (response.data.status === 'error') {
          console.error(`NewsAPI error: ${response.data.message}`)
          if (response.data.code === 'rateLimited') {
            throw new Error('RATE_LIMITED')
          }
        }

        if (response.data.articles) {
          allArticles.push(...response.data.articles)
        }
      } catch (error: any) {
        if (error.message === 'RATE_LIMITED') {
          throw error // Re-throw to be caught at top level
        }
        console.error(`Error fetching news:`, error.message)
      }
    }

    // Remove duplicates based on URL
    const uniqueArticles = Array.from(
      new Map(allArticles.map((article) => [article.url, article])).values()
    )

    // Filter for positive news and categorize
    // If French is selected, STRICTLY filter by French domains
    // Also filter by date - only show articles from last 7 days
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
              // If it doesn't mention Israel at all, it might be wrong
              console.log(`Article doesn't mention Israel: ${article.title}`)
              return false
            }
          }
          
          // If French is selected, STRICTLY only include articles from French domains
          if (newsLanguage === 'fr') {
            const url = (article.url || '').toLowerCase()
            const sourceName = (article.source?.name || '').toLowerCase()
            
            // Check URL domain
            const isFromFrenchDomain = FRENCH_DOMAINS.some(domain => url.includes(domain))
            
            // Also check source name (some APIs return source names)
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

    filteredArticles = filteredArticles
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

    // OPTIMIZED: Removed additional fallback queries to reduce API calls
    // If we don't have enough articles, we'll return what we have
    // The cache will help avoid repeated calls for the same country

    // If we don't have enough articles, try Google News as fallback
    if (filteredArticles.length === 0) {
      console.log(`No articles from NewsAPI, trying Google News RSS fallback for ${countryName}...`)
      try {
        const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
        
        if (googleNewsArticles.length > 0) {
          setCache(cacheKey, googleNewsArticles)
          console.log(`✅ Fetched ${googleNewsArticles.length} articles from Google News`)
          return NextResponse.json(googleNewsArticles)
        } else {
          console.log('Google News returned no articles')
        }
      } catch (googleError: any) {
        console.error('Error fetching Google News:', googleError.message)
      }
      
      // If Google News also fails, don't cache empty - return empty so client can show message
      console.log('No articles found from either NewsAPI or Google News')
      return NextResponse.json([])
    }

    const result = filteredArticles.slice(0, 8)
    
    // Cache the result for 1 hour
    setCache(cacheKey, result)
    console.log(`Cached ${result.length} articles for ${countryCode} (${newsLanguage})`)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching news:', error.message)
    
    if (error.message === 'RATE_LIMITED') {
      // Fallback to Google News RSS when NewsAPI is rate-limited
      console.log('NewsAPI rate limited, falling back to Google News RSS...')
      try {
        const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
        
        if (googleNewsArticles.length > 0) {
          // Cache Google News results too
          setCache(cacheKey, googleNewsArticles)
          console.log(`Fetched ${googleNewsArticles.length} articles from Google News`)
          return NextResponse.json(googleNewsArticles)
        }
      } catch (googleError: any) {
        console.error('Error fetching Google News:', googleError.message)
      }
      
      return NextResponse.json(
        { 
          error: 'RATE_LIMITED',
          message: 'NewsAPI rate limit reached. Free tier allows 100 requests per 24 hours. Please try again later or upgrade to a paid plan.',
        },
        { status: 429 }
      )
    }
    
    // If other error, try Google News as fallback
    console.log('NewsAPI error, trying Google News RSS as fallback...')
    try {
      const googleNewsArticles = await fetchGoogleNews(countryName, newsLanguage)
      
      if (googleNewsArticles.length > 0) {
        setCache(cacheKey, googleNewsArticles)
        return NextResponse.json(googleNewsArticles)
      }
    } catch (googleError: any) {
      console.error('Error fetching Google News:', googleError.message)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch news', details: error.message },
      { status: 500 }
    )
  }
}
