# Morning News 🌅

A beautiful web application to start your day with positive news from around the world. Click on any country on the interactive map to discover uplifting news articles.

## Features

- 🌍 **Interactive World Map**: Click on any country to explore news
- ✨ **Hover Effects**: Countries shine when you hover over them
- 🇫🇷 🇲🇦 **Focus Countries**: France and Morocco are highlighted
- 📰 **Top 8 News Articles**: Curated positive news per country
- 🎯 **News Categories**: 
  - Politics
  - Technology
  - Environment
  - IT Domain (Mulesoft, SAP Commerce Cloud, Life in France)
  - Culture
  - History & Archaeology

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Set up NewsAPI for real news data:
   - Sign up at [NewsAPI](https://newsapi.org/)
   - Get your API key
   - Create a `.env.local` file:
   ```
   NEXT_PUBLIC_NEWS_API_KEY=your_api_key_here
   ```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
morning-news/
├── app/
│   ├── country/[code]/    # Country-specific news pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page with map
├── components/
│   ├── NewsCard.tsx        # News article card component
│   └── WorldMap.tsx        # Interactive world map component
├── lib/
│   └── newsApi.ts          # News API integration
└── package.json
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-simple-maps** - Interactive map component
- **Lucide React** - Icons

## Notes

- Currently uses mock data for demonstration
- To use real news data, configure NewsAPI key in `.env.local`
- The app filters for positive news and excludes negative content
- News articles are categorized automatically based on content

## License

MIT
