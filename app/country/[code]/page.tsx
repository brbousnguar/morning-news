'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import NewsCard from '@/components/NewsCard'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { fetchCountryNews } from '@/lib/newsApi'
import { useLanguage } from '@/contexts/LanguageContext'

interface NewsArticle {
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

export default function CountryNewsPage() {
  const params = useParams()
  const router = useRouter()
  const { t, getCountryName, language } = useLanguage()
  const countryCode = params.code as string
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (countryCode) {
      loadNews()
    }
  }, [countryCode, language])

  const loadNews = async () => {
    setLoading(true)
    setError(null)
    try {
      const news = await fetchCountryNews(countryCode, language)
      setArticles(news)
    } catch (err) {
      setError(t('app.failedToLoad'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const countryName = getCountryName(countryCode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-morning-light to-white p-6">
      <LanguageSwitcher />
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-morning-accent transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t('app.backToMap')}</span>
        </button>

        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            📰 {t('app.newsFrom')} {countryName}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('app.positiveNews')}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-morning-accent"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              {t('app.noNews')} {countryName}. {t('app.tryAnother')}
            </p>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.slice(0, 8).map((article, index) => (
              <NewsCard key={index} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
