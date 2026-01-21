import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getCacheKey, getCached, setCache } from '@/lib/cache'

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

  // Check for negative keywords first
  if (NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return false
  }

  // Check for positive keywords
  return POSITIVE_KEYWORDS.some((keyword) => text.includes(keyword))
}

function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase()

  // Check IT domain first
  if (IT_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return 'IT Domain'
  }

  // Check other categories
  if (text.includes('politic') || text.includes('government') || text.includes('minister') || text.includes('president') || text.includes('parliament')) {
    return 'Politics'
  }
  if (text.includes('tech') || text.includes('digital') || text.includes('software') || text.includes('ai') || text.includes('innovation') || text.includes('startup')) {
    return 'Technology'
  }
  if (text.includes('environment') || text.includes('climate') || text.includes('green') || text.includes('renewable') || text.includes('sustainability') || text.includes('solar') || text.includes('wind energy')) {
    return 'Environment'
  }
  if (text.includes('culture') || text.includes('art') || text.includes('music') || text.includes('festival') || text.includes('heritage') || text.includes('museum') || text.includes('exhibition')) {
    return 'Culture'
  }
  if (text.includes('history') || text.includes('archaeology') || text.includes('discovery') || text.includes('ancient') || text.includes('historical') || text.includes('archaeological')) {
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

  const countryName = COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode.toLowerCase()
  const newsLanguage = language === 'fr' ? 'fr' : 'en'

  // Check cache first
  const cacheKey = getCacheKey(countryCode, newsLanguage)
  const cachedData = getCached(cacheKey)
  if (cachedData) {
    console.log(`Cache hit for ${countryCode} (${newsLanguage})`)
    return NextResponse.json(cachedData)
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
        const params: any = {
          q: query,
          language: 'fr',
          domains: domains,
          sortBy: 'publishedAt',
          pageSize: 50, // Get more articles in one call
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
      const query = `${countryName} AND (technology OR innovation OR startup OR environment OR climate OR renewable OR culture OR art OR music OR festival OR politics OR government OR history OR archaeology OR discovery OR mulesoft OR "sap commerce" OR "french tech")`
      
      try {
        const params: any = {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 50, // Get more articles in one call
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
    let filteredArticles = uniqueArticles
      .filter(
        (article: any) => {
          const hasContent = article.title && article.description && article.url
          if (!hasContent) return false
          
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
            
            // Also check if title/description contain French words (basic check)
            const text = `${article.title} ${article.description}`.toLowerCase()
            const hasFrenchWords = /\b(le|la|les|un|une|des|de|du|et|ou|est|sont|pour|avec|dans|sur|par|maroc|france|français|française)\b/i.test(text)
            
            // If it's from a French domain but content seems English, still include it
            // (some French sites have English articles)
          }
          
          // For now, be less strict with positive news filter to ensure we get results
          // You can make this stricter later if needed
          const isPositive = isPositiveNews(article.title, article.description || '')
          
          // If we have very few articles, be more lenient
          if (!isPositive && uniqueArticles.length < 5) {
            // Allow articles that don't have negative keywords
            const text = `${article.title} ${article.description}`.toLowerCase()
            const hasNegative = NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))
            return !hasNegative
          }
          
          return isPositive
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
        category: categorizeArticle(article.title, article.description || ''),
      }))
      .slice(0, 8)

    // OPTIMIZED: Removed additional fallback queries to reduce API calls
    // If we don't have enough articles, we'll return what we have
    // The cache will help avoid repeated calls for the same country

    // If French is selected and we still don't have articles, return empty array instead of falling back
    if (newsLanguage === 'fr' && filteredArticles.length === 0) {
      console.log('No French articles found, returning empty array')
      const emptyResult: any[] = []
      setCache(cacheKey, emptyResult) // Cache empty result too to avoid repeated calls
      return NextResponse.json(emptyResult)
    }

    const result = filteredArticles.slice(0, 8)
    
    // Cache the result for 1 hour
    setCache(cacheKey, result)
    console.log(`Cached ${result.length} articles for ${countryCode} (${newsLanguage})`)
    
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error fetching news:', error.message)
    
    if (error.message === 'RATE_LIMITED') {
      return NextResponse.json(
        { 
          error: 'RATE_LIMITED',
          message: 'NewsAPI rate limit reached. Free tier allows 100 requests per 24 hours. Please try again later or upgrade to a paid plan.',
        },
        { status: 429 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch news', details: error.message },
      { status: 500 }
    )
  }
}
