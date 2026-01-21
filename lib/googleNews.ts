// Browser-compatible RSS parser using fetch and DOMParser
async function parseRSSFeed(url: string): Promise<any> {
  try {
    // Use a CORS proxy for Google News RSS (since Google News RSS doesn't allow direct CORS)
    // Note: In production, you might want to use your own proxy or a service like allorigins.win
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    
    const response = await fetch(proxyUrl)
    const data = await response.json()
    
    if (!data.contents) {
      throw new Error('No RSS content received')
    }
    
    // Parse XML using DOMParser
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data.contents, 'text/xml')
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      throw new Error('Failed to parse RSS feed')
    }
    
    // Extract items
    const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => {
      const title = item.querySelector('title')?.textContent || ''
      const link = item.querySelector('link')?.textContent || ''
      const pubDate = item.querySelector('pubDate')?.textContent || ''
      const description = item.querySelector('description')?.textContent || ''
      const content = item.querySelector('content\\:encoded')?.textContent || description
      const contentSnippet = description.replace(/<[^>]*>/g, '').substring(0, 200)
      
      return {
        title,
        link,
        pubDate,
        description,
        content,
        contentSnippet,
      }
    })
    
    return { items }
  } catch (error) {
    console.error('Error parsing RSS feed:', error)
    throw error
  }
}

interface GoogleNewsArticle {
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
  'murder',
  'bomb',
  'terror',
]

function isPositiveNews(title: string, description: string): boolean {
  const text = `${title} ${description}`.toLowerCase()

  // Check for negative keywords first - exclude if found
  if (NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword))) {
    return false
  }

  // For Google News, be more lenient - if no negative keywords, include it
  // This allows more articles through while still filtering out bad news
  return true
}

function categorizeArticle(title: string, description: string, language: string = 'en'): string {
  const text = `${title} ${description}`.toLowerCase()

  // French keywords
  const isFrench = language === 'fr'
  
  // Politics keywords (French and English)
  const politicsKeywords = isFrench 
    ? ['politique', 'gouvernement', 'ministre', 'président', 'parlement', 'élection', 'parti', 'roi', 'monarchie']
    : ['politic', 'government', 'minister', 'president', 'parliament', 'election', 'party', 'king', 'monarchy']
  
  // Technology keywords
  const techKeywords = isFrench
    ? ['technologie', 'techno', 'digital', 'informatique', 'innovation', 'startup', 'ia', 'intelligence artificielle']
    : ['tech', 'digital', 'software', 'ai', 'innovation', 'startup', 'computer', 'internet']
  
  // Environment keywords
  const envKeywords = isFrench
    ? ['environnement', 'climat', 'écologie', 'vert', 'renouvelable', 'durable', 'solaire', 'éolien']
    : ['environment', 'climate', 'green', 'renewable', 'sustainability', 'solar', 'wind']
  
  // Culture keywords
  const cultureKeywords = isFrench
    ? ['culture', 'art', 'musique', 'festival', 'patrimoine', 'cinéma', 'théâtre', 'littérature', 'football', 'sport', 'can', 'championnat']
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

export async function fetchGoogleNews(countryName: string, language: string = 'en'): Promise<GoogleNewsArticle[]> {
  try {
    // Google News RSS feed URLs
    const langCode = language === 'fr' ? 'fr' : 'en'
    
    // Special handling for countries that might be confused with US states or other places
    let searchQuery = countryName
    if (countryName.toLowerCase() === 'israel' || countryName.toLowerCase() === 'il') {
      // Use "Israel" explicitly and exclude Illinois and US states
      searchQuery = '"Israel" OR "State of Israel" -Illinois -"state of Illinois" -"IL state" -"Illinois state"'
    }
    
    const countryQuery = encodeURIComponent(searchQuery)
    
    // Use Google News RSS feed with date filter (last 7 days)
    // For French: https://news.google.com/rss/search?q=maroc&hl=fr&gl=FR&ceid=FR:fr&when=7d
    // For English: https://news.google.com/rss/search?q=morocco&hl=en&gl=US&ceid=US:en&when=7d
    const rssUrl = language === 'fr' 
      ? `https://news.google.com/rss/search?q=${countryQuery}&hl=fr&gl=FR&ceid=FR:fr&when=7d`
      : `https://news.google.com/rss/search?q=${countryQuery}&hl=en&gl=US&ceid=US:en&when=7d`

    console.log(`Fetching Google News RSS: ${rssUrl}`)
    
    const feed = await parseRSSFeed(rssUrl)

    if (!feed.items || feed.items.length === 0) {
      return []
    }

    const articles: GoogleNewsArticle[] = []

    // Filter articles by date (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    for (const item of feed.items.slice(0, 30)) {
      const title = item.title || ''
      const description = item.contentSnippet || item.content || ''
      const text = `${title} ${description}`.toLowerCase()
      
      // Filter by date - only show articles from last 7 days
      if (item.pubDate) {
        const articleDate = new Date(item.pubDate)
        if (isNaN(articleDate.getTime()) || articleDate < sevenDaysAgo) {
          continue
        }
      }
      
      // Special check: If searching for Israel, exclude Illinois articles
      if (countryName.toLowerCase() === 'israel' || countryName.toLowerCase() === 'il') {
        if (text.includes('illinois') || text.includes('chicago') || text.includes('springfield') || 
            text.includes('state of illinois') || text.includes('il state')) {
          console.log(`Filtered out Illinois article: ${title}`)
          continue
        }
        // Prefer articles that mention Israel
        if (!text.includes('israel') && !text.includes('israeli') && !text.includes('jerusalem') && 
            !text.includes('tel aviv') && !text.includes('gaza') && !text.includes('west bank') &&
            !text.includes('palestine') && !text.includes('middle east')) {
          // If it doesn't mention Israel/Middle East at all, skip it
          continue
        }
      }
      
      // Skip if it's negative news
      if (!isPositiveNews(title, description)) {
        continue
      }

      // Extract image from content if available
      let imageUrl: string | null = null
      if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/i)
        if (imgMatch) {
          imageUrl = imgMatch[1]
        }
      }

      // Extract source name from article text or URL
      let sourceName = 'Google News'
      const articleText = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`
      
      try {
        // First, try to extract source name from article text (many articles include source at the end)
        const sourcePatterns = [
          // French sources
          /(?:^|\s)(Le\s+Monde|Le\s+Figaro|Libération|Le\s+Parisien|France\s+24|RFI|BFMTV|L'Express|Le\s+Point|Marianne|L'Obs|RTL|Europe\s+1|France\s+Inter|Boursorama|Les\s+Échos|Le\s+Temps|La\s+Tribune|Challenges|Capital|Le\s+Journal\s+du\s+Dimanche)(?:\.fr|\.com|\.net)?/i,
          // International sources
          /(?:^|\s)(Reuters|BBC|CNN|The\s+New\s+York\s+Times|The\s+Guardian|Associated\s+Press|AP|Al\s+Jazeera|Deutsche\s+Welle|Der\s+Spiegel|El\s+País|ANSA|Corriere\s+della\s+Sera|The\s+Washington\s+Post|Bloomberg|Financial\s+Times|Wall\s+Street\s+Journal|WSJ)/i,
        ]
        
        for (const pattern of sourcePatterns) {
          const match = articleText.match(pattern)
          if (match) {
            sourceName = match[1].trim()
            // Clean up common suffixes
            sourceName = sourceName.replace(/\.(fr|com|net|org)$/i, '')
            break
          }
        }
        
        // If not found in text, try to extract from URL
        if (sourceName === 'Google News' && item.link) {
          const url = new URL(item.link)
          const hostname = url.hostname.replace('www.', '')
          
          // Map common domains to proper source names
          const domainToSource: { [key: string]: string } = {
            'lemonde.fr': 'Le Monde',
            'lefigaro.fr': 'Le Figaro',
            'liberation.fr': 'Libération',
            'leparisien.fr': 'Le Parisien',
            'france24.com': 'France 24',
            'rfi.fr': 'RFI',
            'bfmtv.com': 'BFMTV',
            'lexpress.fr': "L'Express",
            'lepoint.fr': 'Le Point',
            'marianne.net': 'Marianne',
            'nouvelobs.com': "L'Obs",
            'rtl.fr': 'RTL',
            'europe1.fr': 'Europe 1',
            'franceinter.fr': 'France Inter',
            'boursorama.com': 'Boursorama',
            'lesechos.fr': 'Les Échos',
            'reuters.com': 'Reuters',
            'reuters.co.uk': 'Reuters',
            'bbc.com': 'BBC',
            'bbc.co.uk': 'BBC',
            'cnn.com': 'CNN',
            'nytimes.com': 'The New York Times',
            'theguardian.com': 'The Guardian',
            'ap.org': 'Associated Press',
            'apnews.com': 'Associated Press',
            'aljazeera.com': 'Al Jazeera',
            'dw.com': 'Deutsche Welle',
            'spiegel.de': 'Der Spiegel',
            'elpais.com': 'El País',
            'ansa.it': 'ANSA',
            'corriere.it': 'Corriere della Sera',
          }
          
          // Check if we have a mapping
          if (domainToSource[hostname]) {
            sourceName = domainToSource[hostname]
          } else {
            // Try to extract from hostname intelligently
            const parts = hostname.split('.')
            if (parts.length >= 2) {
              // Take the domain name part (e.g., "lemonde" from "lemonde.fr")
              const domainPart = parts[parts.length - 2]
              // Capitalize properly
              sourceName = domainPart
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
            }
          }
        }
      } catch {
        // Use default
      }

      articles.push({
        title: item.title || 'No title',
        description: item.contentSnippet || item.content?.replace(/<[^>]*>/g, '').substring(0, 200) || '',
        url: item.link || '',
        urlToImage: imageUrl,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source: {
          name: sourceName,
        },
        category: categorizeArticle(item.title || '', item.contentSnippet || item.content || '', language),
      })
    }

    // Sort by date - newest first
    articles.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return dateB - dateA // Descending order (newest first)
    })

    return articles.slice(0, 8)
  } catch (error) {
    console.error('Error fetching Google News:', error)
    return []
  }
}
