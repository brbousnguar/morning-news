'use client'

import Image from 'next/image'
import { ExternalLink, Calendar } from 'lucide-react'
import { useState } from 'react'
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

interface NewsCardProps {
  article: NewsArticle
}

const categoryTranslations: { [key: string]: { en: string; fr: string } } = {
  'Politics': { en: 'Politics', fr: 'Politique' },
  'Technology': { en: 'Technology', fr: 'Technologie' },
  'Environment': { en: 'Environment', fr: 'Environnement' },
  'IT Domain': { en: 'IT Domain', fr: 'Domaine IT' },
  'Culture': { en: 'Culture', fr: 'Culture' },
  'History & Archaeology': { en: 'History & Archaeology', fr: 'Histoire et Archéologie' },
  'General': { en: 'General', fr: 'Général' },
}

export default function NewsCard({ article }: NewsCardProps) {
  const [imageError, setImageError] = useState(false)
  const { language, t } = useLanguage()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getCategoryLabel = (category: string): string => {
    const translation = categoryTranslations[category]
    if (translation) {
      return translation[language]
    }
    return category
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {article.urlToImage && !imageError && (
        <div className="relative w-full h-48 bg-gray-200">
          <Image
            src={article.urlToImage}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <span className="inline-block bg-morning-primary/20 text-morning-primary text-xs font-semibold px-2 py-1 rounded">
            {getCategoryLabel(article.category)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {article.description}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(article.publishedAt)}
            </span>
            <span>{article.source.name}</span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-morning-accent hover:text-morning-primary transition-colors text-sm font-semibold"
          >
            {t('app.readMore')}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
