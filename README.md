# DealPlate 🍽️ - Food Deal Discovery App (Islamabad, Pakistan)

DealPlate is a mobile app built with Expo, Expo Router, and TypeScript designed to discover real-time food deals, BOGOs, and discounts across Islamabad.

---

## 🚀 Quick Setup & Run Commands

### 1. Installation & Environment

```bash
npm install
cp .env.example .env
```

### 2. Launch App

```bash
npx expo start
```

- Press `a` for Android Emulator or scan the QR code with **Expo Go** on a physical Android device.

### 3. Running Verification Protocol

```bash
npm run typecheck   # Type check strict mode
npm run lint        # ESLint code linting
npm test            # Jest unit test suite
```

---

## 📂 Project Structure Map

```
islamabad-deals-app/
├── AGENTS.md                  # Standing rules & architectural constraints
├── .agents/rules/AGENTS.md    # Mirrored workspace rules
├── app.config.ts              # Expo app configuration
├── app/                       # Expo Router Screens (UI Layer ONLY)
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Bottom tab navigator (Home, Explore, Saved, Profile)
│   │   ├── index.tsx          # Home Feed Screen Shell
│   │   ├── explore.tsx        # Explore stub screen
│   │   ├── saved.tsx          # Saved deals stub screen
│   │   └── profile.tsx        # Profile & settings stub screen
│   ├── _layout.tsx            # Root layout, providers & font loading
│   ├── deal/[id].tsx          # Deal detail stub route
│   ├── restaurant/[id].tsx    # Restaurant detail stub route
│   ├── search.tsx             # Search overlay route
│   ├── category/[slug].tsx    # Category feed route
│   └── notifications.tsx     # Notifications feed route
├── src/
│   ├── components/
│   │   ├── ui/                # Base design system (Text, Button, Card, Chip, Badge, Skeleton, etc.)
│   │   ├── deal/              # Deal components (DealCard, DealBadge, ExpiryPill)
│   │   ├── restaurant/        # Restaurant components (RestaurantCard)
│   │   └── common/            # Shared components (ErrorBoundary, CategoryChips)
│   ├── features/              # Feature business logic & TanStack Query hooks
│   │   ├── deals/             # Feeds, deal hooks
│   │   ├── restaurants/       # Restaurant hooks
│   │   └── {auth, search, favorites, notifications, admin, location, ordering}/
│   ├── services/
│   │   ├── api/               # Abstract service contracts (DealsService, etc.)
│   │   └── mock/              # Latency-simulated mock data (14 Islamabad restaurants & 28 deals)
│   ├── theme/                 # Design system tokens (colors, typography, spacing, radii, shadows)
│   ├── types/                 # Domain interfaces (Deal, Restaurant, OpeningHours, etc.)
│   ├── utils/                 # Tested utilities (time, price, openingHours, dealStatus, distance)
│   └── lib/                   # Config wrappers (env validation, logger, queryClient)
├── __tests__/                 # Jest test suite (env, time, price, openingHours, dealStatus, distance)
└── supabase/                  # Database migrations & edge functions (Prompt 03)
```

---

## 🧪 Demonstrating UI States (Loading, Empty, Error)

1. **Loading State**: App automatically shows animated skeleton shimmers during service fetch.
2. **Error State & Retry**: Set `EXPO_PUBLIC_DEBUG_ERRORS=true` in `.env` or `src/lib/env.ts` to trigger simulated network failures and view `ErrorState` with retry buttons.
3. **Empty State**: Triggered when search queries or category filters return 0 results.

---

## ⚠️ Configuration Note

The `android.package` and `ios.bundleIdentifier` in `app.config.ts` are set to `com.yourname.dealplate`. Update these placeholders to match your organization bundle identifier when initializing EAS builds.
