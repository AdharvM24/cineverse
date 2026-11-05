# CineVerse — Premium Netflix-Inspired Movie Discovery App 🎬🍿

A production-quality movie and TV series discovery mobile application built with **React Native**, **Expo SDK 58**, **TypeScript**, **Expo Router**, **Supabase**, and the official **TMDB API**.

Inspired by Netflix's signature cinematic dark UI, designed specifically with a focus on **Malayalam cinema**, **Indian cinema**, **International acclaimed titles**, and **popular web series**.

---

## ✨ Features & Highlights

### 1. 🎥 Home Screen & Feed
- **Netflix Red & Onyx Dark Design**: Premium `#09090B` background with `#18181B` elevated cards and `#E50914` accents.
- **Cinematic Featured Banner**: High-resolution backdrop hero showcasing the top trending movie of the day with title, release year, genre badges, IMDb rating, and one-tap "+ Watchlist" & "Trailer" buttons.
- **10 Curated Horizontal Sections**:
  1. *Trending Today* (Top 10 with oversized Netflix-style typographic rank badges)
  2. *Trending This Week*
  3. *Popular Malayalam Movies* (Real-time live TMDB Malayalam discovery: `with_original_language=ml`)
  4. *Popular Indian Cinema* (`with_origin_country=IN`)
  5. *International Masterpieces* (Acclaimed non-English international cinema)
  6. *Popular Web Series & TV Shows*
  7. *Currently Airing TV Shows*
  8. *Upcoming Theatrical Releases*
  9. *Top Rated Movies of All Time*
  10. *Recommended For You*
- **Category Deep Dive ("See All")**: Full paginated grid exploration with infinite scroll for any category.

### 2. 🍿 Movie & TV Details Screen
- **Full-Width Hero Backdrop & Vignettes**: Linear gradients seamlessly blend into the dark canvas.
- **IMDb-Style Gold Star Rating**: Precise rating display (`vote_average`) with total vote counter.
- **Official YouTube Trailers**: Direct in-app trailer playback powered by `react-native-webview` with external app link fallback.
- **Where to Watch (Legal Streaming Providers)**: Integrates JustWatch via TMDB watch providers for India (`IN`) and global regions (Netflix, Amazon Prime Video, Disney+ Hotstar, SonyLIV, Zee5, Apple TV).
- **TV Series Episode Explorer**: Season selector tabs with episode stills, episode runtimes, and storyline descriptions.
- **Cast & Crew**: Horizontal scroll with actor portraits, character names, and real names.
- **More Like This**: Intelligent similar recommendations.

### 3. 🔍 Real-Time Search & Discovery
- **Debounced Live Search**: Instant multi-search across movies, TV series, and actors.
- **Dynamic Filters**: Filter results by Media Type (Movie/TV/All), Language (Malayalam, Hindi, Tamil, Telugu, English, Korean), and Genre (Action, Comedy, Drama, Thriller, Sci-Fi, Horror).
- **Recent Search History**: Persisted in local storage with one-tap recall and clear option.
- **Popular Regional Suggestions**: One-tap quick searches for trending Malayalam and Indian hits (Aavesham, Manjummel Boys, Premalu, Bramayugam, Kalki, etc.).

### 4. 📌 Watchlist & Favorites
- **Dual Tab Library**: Dedicated tabs for *My Watchlist* and *Favorites*.
- **Sync & Offline Support**: Dual-layer architecture: synchronizes with Supabase cloud when connected; persists locally in `AsyncStorage` when offline or in demo mode.
- **One-Tap Removal**: Easy item removal directly from cards.

### 5. 🔐 Supabase Authentication & PostgreSQL Backend
- **Email Registration & Login**: Built-in authentication flow.
- **User Profile Management**: Editable name, profile avatar, email display, and library stats.
- **Row Level Security (RLS)**: Strict security policies ensuring users only access their own private watchlist and favorites.
- **Ready-to-Run SQL Script**: Complete `supabase_schema.sql` file included for 1-click database deployment.

---

## 🏗️ Technology Stack

| Component | Technology |
|---|---|
| **Framework** | Expo SDK 58 (React Native 0.88.1, React 19) |
| **Language** | TypeScript (Strict mode enabled) |
| **Navigation** | Expo Router (File-based tabs and dynamic stack) |
| **Data Fetching & Cache** | TanStack Query (React Query v5) |
| **State Management** | Zustand |
| **Backend & Auth** | Supabase JS & PostgreSQL with RLS |
| **Local Storage** | React Native AsyncStorage |
| **Images & Gradients** | `expo-image` (memory-disk cache), `expo-linear-gradient` |
| **Video Playback** | `react-native-webview` |
| **Icons** | `lucide-react-native` + `react-native-svg` |

---

## 📁 Project Architecture

```
TMDB/
├── app/
│   ├── _layout.tsx              # Root Layout: QueryClient, Theme, Navigation Stack
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom Tab Navigator (Home, Search, Watchlist, Profile)
│   │   ├── index.tsx            # Home Screen: AppHeader, HeroBanner, 10 Carousels
│   │   ├── search.tsx           # Search Screen: Debounce, Filters, History, Results
│   │   ├── watchlist.tsx        # Saved Library: Watchlist & Favorites tabs
│   │   └── profile.tsx          # Profile & Supabase Auth Screen
│   ├── movie/
│   │   └── [id].tsx             # Movie Details: Trailer, Providers, Cast, Similar
│   ├── tv/
│   │   └── [id].tsx             # TV Details: Seasons, Episodes, Cast, Providers
│   └── category/
│       └── [type].tsx           # See All: Paginated Grid View for Categories
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx        # Netflix-style header with logo & personalized greeting
│   │   ├── FeaturedBanner.tsx   # Cinematic hero backdrop with quick actions
│   │   ├── MovieCard.tsx        # Poster card with IMDb rating & Top 10 rank numbers
│   │   ├── MovieSection.tsx     # Reusable horizontal carousel with "See All"
│   │   ├── RatingBadge.tsx      # Gold star IMDb rating badge
│   │   ├── TrailerModal.tsx     # In-app YouTube trailer player modal
│   │   ├── WatchProvidersModal.tsx # Legal streaming availability sheet
│   │   └── LoadingSkeleton.tsx  # Shimmer loading placeholders
│   ├── hooks/
│   │   ├── useMovies.ts         # Home feed, movie details, TV details & seasons
│   │   ├── useSearch.ts         # Search & debounced filtering
│   │   └── useTrending.ts       # Daily & weekly trending hooks
│   ├── services/
│   │   ├── tmdb.ts              # TMDB API v3 service with Malayalam & Indian endpoints
│   │   ├── supabase.ts          # Supabase client with offline store fallback
│   │   └── youtube.ts           # YouTube trailer extractor & embed URL builder
│   ├── store/
│   │   ├── authStore.ts         # Auth session & profile Zustand store
│   │   └── watchlistStore.ts    # Watchlist & Favorites Zustand store
│   ├── theme/
│   │   ├── colors.ts            # Design system palette (#09090B, #18181B, #E50914)
│   │   └── typography.ts        # Type scale & text styles
│   ├── types/
│   │   ├── movie.ts             # TMDB Movie, Cast, Videos, Providers interfaces
│   │   ├── tv.ts                # TV Show, Season, Episode interfaces
│   │   └── supabase.ts          # Supabase Profile, Watchlist, Favorite interfaces
│   └── utils/
│       ├── constants.ts         # TMDB endpoints, genres map, language labels
│       ├── formatters.ts        # Runtime, dates, ratings & currency formatters
│       └── imageUrl.ts          # TMDB CDN image URL builders (w342, w500, w1280)
├── supabase_schema.sql          # Complete PostgreSQL schema with RLS policies
├── app.json                     # Expo configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
An active TMDB API key is already configured in `.env` by default so live data fetches immediately.

### 3. Setup Supabase Database (Optional for Cloud Sync)
Open your Supabase project's **SQL Editor** and execute the entire contents of [`supabase_schema.sql`](./supabase_schema.sql).
Then update `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.

*(Note: If no Supabase credentials are provided, CineVerse automatically runs in offline/local persistence mode via AsyncStorage without any crashes).*

### 4. Start the Development Server
```bash
npx expo start
```
- Press `a` to run on Android emulator or connected device
- Press `w` to run on Web browser
- Scan the QR code with the Expo Go app on iOS/Android

### 5. Quality & Type Checking
```bash
npx tsc --noEmit     # Verify TypeScript compilation (0 errors)
npx expo-doctor      # Verify Expo SDK compatibility (20/20 checks passed)
```

---

## 📜 Legal & Attribution
This product uses the **TMDB API** but is not endorsed or certified by TMDB.
Movie streaming availability data is provided by **JustWatch** via the TMDB Watch Providers service. CineVerse directs users exclusively to legal, authorized streaming providers.

