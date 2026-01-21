import axios from 'axios'

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
  // Add more mappings as needed
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
  if (text.includes('politic') || text.includes('government') || text.includes('minister')) {
    return 'Politics'
  }
  if (text.includes('tech') || text.includes('digital') || text.includes('software') || text.includes('ai') || text.includes('innovation')) {
    return 'Technology'
  }
  if (text.includes('environment') || text.includes('climate') || text.includes('green') || text.includes('renewable') || text.includes('sustainability')) {
    return 'Environment'
  }
  if (text.includes('culture') || text.includes('art') || text.includes('music') || text.includes('festival') || text.includes('heritage')) {
    return 'Culture'
  }
  if (text.includes('history') || text.includes('archaeology') || text.includes('discovery') || text.includes('ancient') || text.includes('historical')) {
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

  try {
    // Call our Next.js API route which handles NewsAPI server-side
    const response = await fetch(`/api/news?country=${encodeURIComponent(countryCode)}&language=${encodeURIComponent(language)}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Check if it's a rate limit error
      if (response.status === 429 || errorData.error === 'RATE_LIMITED') {
        console.warn('NewsAPI rate limit reached. Using mock data.')
        // Fallback to mock data when rate limited
        const mockData = await fetchMockNews(countryCode)
        setCachedClientData(countryCode, language, mockData) // Cache mock data too
        return mockData
      }
      
      throw new Error(`API responded with status ${response.status}`)
    }

    const data = await response.json()

    if (data && Array.isArray(data)) {
      // If French is selected and we have no articles, return empty array (don't fallback to English mock)
      if (language === 'fr' && data.length === 0) {
        console.log('No French articles found, returning empty array')
        setCachedClientData(countryCode, language, []) // Cache empty result
        return []
      }
      
      if (data.length > 0) {
        setCachedClientData(countryCode, language, data) // Cache successful results
        return data as NewsArticle[]
      }
    }

    // Only fallback to mock data if English is selected
    if (language === 'en') {
      const mockData = await fetchMockNews(countryCode)
      setCachedClientData(countryCode, language, mockData)
      return mockData
    }
    
    // For French, return empty array if no articles found
    setCachedClientData(countryCode, language, [])
    return []
  } catch (error) {
    console.error('Error fetching news:', error)
    // Only fallback to mock data if English is selected
    if (language === 'en') {
      const mockData = await fetchMockNews(countryCode)
      setCachedClientData(countryCode, language, mockData)
      return mockData
    }
    setCachedClientData(countryCode, language, [])
    return []
  }
}
