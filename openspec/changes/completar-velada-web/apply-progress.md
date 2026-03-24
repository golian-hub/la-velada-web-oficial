# SDD Apply Progress — completar-velada-web

## ✅ FASE 1 — DATA & FOUNDATION (COMPLETADA)

1. **combats.ts** — winners=null, Velada VI descriptions, ordered with main event last
2. **Layout.astro JSON-LD** — Estadio La Cartuja, Sevilla, July 25 2026, full Schema.org with tickets
3. **src/lib/auth.ts** — Anonymous user ID via cookies, setUserIdCookie, extractUserId, getSession helpers
4. **src/pages/api/predictions.ts** — GET/POST API endpoint with Turso DB integration

## ✅ FASE 2 — PAGES & ROUTES (COMPLETADA)

5. **src/pages/luchador/[id].astro** — Fighter profile pages (moved from \_old/, SSR mode)
6. **src/pages/combates/index.astro** — Combats listing with main event highlight + prediction bars (new)
7. **src/pages/combates/[id].astro** — Individual combat detail pages (moved from \_old/, SSR)
8. **src/pages/porra.astro** — Predictions voting page with confetti on vote (moved from \_old/, SSR)
9. **src/pages/artists.astro** — Artists listing page (new)
10. **src/components/Navigation.astro** — Responsive header with desktop nav + mobile hamburger menu (new)
11. **src/layouts/Layout.astro** — Updated with Navigation import + JSON-LD fix
12. **src/sections/FightersSection.astro** — Fighter showcase with BoxerCards grid (new)
13. **src/sections/CombatsSection.astro** — Combats preview with main event + card grid (new)
14. **src/sections/ArtistsSection.astro** — Horizontal scroll artists gallery with Unsplash fallbacks (new)

## ✅ IMAGE FALLBACKS (COMPLETADA)

- **src/components/BoxerCard.astro** — onerror shows gradient + fighter name
- **src/components/BoxerProfileCard.astro** — onerror fallback with gradient + name

## ✅ INDEX.astro UPDATED

- Added FightersSection, CombatsSection, ArtistsSection
- Added "La Porra" CTA section
- All pages now interconnected with navigation

## Build Status:

- ✅ Astro build: SUCCESS
- ✅ Dev server: WORKING (localhost:4321)
- ⚠️ Vercel deploy: EPERM symlink error (Windows-specific permission issue, not a code problem)

## ❌ PENDIENTE (Phases 3-6)

- BoxerGallery, BoxerWorkout onerror fallbacks
- Custom scrollbar styling (gold thumb)
- PWA manifest.json + service worker
- View Transitions on fighter/combat pages
- Staggered scroll animations
- BoxerGallery gallery images (need real assets or better placeholders)
- BoxerWorkout thumbnail fallbacks
- Full testing (all routes, responsive, 404)

## Important Decisions:

- All pages use SSR (prerender=false) except index and 404
- Turso DB fallback: pages show default 50/50 predictions when DB unavailable
- Anonymous voting: cookies-based user identification via crypto.randomUUID
- Artists use Unsplash images as fallbacks for missing artist photos
- Navigation uses backdrop-blur, appears on scroll
- Combats listed in reverse order (main event first)
- Fighters separated by gender (female combats first on FightersSection)
