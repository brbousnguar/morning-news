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

## Deployment to GitHub Pages

This app is configured for static export and can be deployed to GitHub Pages.

### Important Notes

⚠️ **API Key Security**: The NewsAPI key is currently hardcoded in `lib/newsApi.ts` and will be exposed in the browser when deployed. For production, consider:
- Using environment variables (though they'll still be exposed in static builds)
- Using a proxy service to hide your API key
- Rotating your API key regularly

### Deployment Steps

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

3. **Configure Base Path** (if needed):
   - If your repository is at `github.com/username/morning-news`, the app will automatically use `/morning-news` as the base path
   - To customize, update the `BASE_PATH` environment variable in `.github/workflows/deploy.yml`
   - Or set it in `next.config.js` directly

4. **Automatic Deployment**:
   - The GitHub Actions workflow will automatically build and deploy your app on every push to `main`
   - Your site will be available at `https://username.github.io/morning-news/`

### Manual Build (for testing)

To test the static export locally:

```bash
npm run build
```

The static files will be in the `out` directory. You can serve them with any static file server:

```bash
npx serve out
```

## Notes

- The app filters for positive news and excludes negative content
- News articles are categorized automatically based on content
- Uses client-side caching (localStorage) to reduce API calls
- Falls back to Google News RSS if NewsAPI rate limit is reached

## License

MIT
