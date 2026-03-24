# Exploration: completar-velada-web

## Executive Summary

La Velada VI (25 julio 2026, Sevilla) web está ~65% completa. El landing principal tiene Hero, Countdown, Artists, FAQ, Sponsors y Footer. Faltan completamente las páginas de luchadores, combats, la porra funcional, sistema de predicción, auth, y todo el contenido visual (imágenes de boxeadores, fights, combats). El stack es sólido (Astro 5.18 SSR + Tailwind v4 + Turso/LibSQL + auth-astro), la infraestructura de predicciones existe pero está en `_old/`.

---

## 1. User Journeys

### Journey A: Fan casual que llega por primera vez

1. Llega a la web por redes/social/SEO
2. Ve el Hero con countdown y fecha (25 julio 2026, Sevilla)
3. Quiere saber qué boxeadores participan → **NO HAY PÁGINA DE LUCHADORES** ← GAP CRÍTICO
4. Quiere saber cómo comprar entradas → **SOLO BOTÓN ESTÁTICO** "ENTRADAS AGOTADAS"
5. Quiere seguir en redes → enlaces a Twitch/YT/TikTok en el Hero

### Journey B: Fan que quiere seguir la evolución de los combates

1. Busca información sobre un combate específico
2. Quiere ver estadísticas de boxeadores → **NO EXISTE** `/luchador/[id]`
3. Quiere ver clips y entrevistas → **NO EXISTE** página individual
4. Quiere ver el video del combate → **NO EXISTE** `/combates/[id]`

### Journey C: Usuario que quiere participar en la porra

1. Quiere votar por su favorito → `/porra` está en `_old/`
2. Necesita autenticarse → auth-astro instalado pero **NO INTEGRADO**
3. Quiere ver predicciones aggregate → funcionalidad existe en `lib/predictions.ts` pero **NO HAY API ROUTE ACTIVA**

### Journey D: Fan el día del evento

1. Quiere ver el stream → **NO HAY sección de LIVE**
2. Quiere ver resultados en tiempo real → **NO EXISTE**

---

## 2. Feature Requirements

### Fase 1 — Páginas Core (MVP)

| Feature                                | Priority | Status    | Files Needed                                           |
| -------------------------------------- | -------- | --------- | ------------------------------------------------------ |
| `/luchador/[id]` fighter profile pages | CRÍTICA  | No existe | `src/pages/luchador/[id].astro` (migrate from `_old/`) |
| `/combates` listing page               | CRÍTICA  | No existe | `src/pages/combates/index.astro`                       |
| `/combates/[id]` combat detail pages   | CRÍTICA  | No existe | `src/pages/combates/[id].astro` (migrate from `_old/`) |
| Home page sections as standalone pages | ALTA     | Partial   | Artists, FAQ ya existen como components                |
| `/porra` page (migrate + fix)          | ALTA     | `_old/`   | `src/pages/porra.astro`                                |
| API route `/api/predictions`           | ALTA     | `_old/`   | `src/pages/api/predictions.ts`                         |

### Fase 2 — Contenido Visual (Critical Path Blocker)

| Resource                                              | Required For                  | Priority |
| ----------------------------------------------------- | ----------------------------- | -------- |
| Fighter portraits: `/images/fighters/big/{id}.webp`   | `/luchador/[id]`, `BoxerCard` | CRÍTICA  |
| Fighter text logos: `/images/fighters/text/{id}.webp` | `/luchador/[id]`              | CRÍTICA  |
| Fighter gallery images                                | `/luchador/[id]` gallery      | ALTA     |
| Combat images: `/images/fighters/combat/{id}.webp`    | `/porra`, `/combates/[id]`    | CRÍTICA  |
| Combat backgrounds: `/images/combates/{id}.webp`      | `/combates/[id]` video bg     | ALTA     |
| Workout thumbnails: `workoutThumbnails/{id}.webp`     | `BoxerWorkout` component      | MEDIA    |
| Artist images                                         | `Artists.astro` section       | CRÍTICA  |
| Background hero: `background.avif/webp/png`           | Already exists                | ✅       |
| Logo variants: `logo.avif/webp/png`                   | Already exists                | ✅       |
| OG image update                                       | SEO/Social sharing            | ALTA     |

### Fase 3 — Predictions & Auth

| Feature                           | Status                    | Notes                                                 |
| --------------------------------- | ------------------------- | ----------------------------------------------------- |
| Auth with auth-astro              | Configurado, no integrado | Need to integrate into porra, possibly luchador pages |
| `/api/predictions` POST           | `_old/`, needs SSR route  | `src/pages/api/predictions.ts`                        |
| `/api/predictions` GET            | `_old/`, needs SSR route  | Fetch user votes                                      |
| Memory cache (30s) in predictions | ✅ Working                | `src/lib/predictions.ts`                              |
| Turso DB predictions table        | ✅ Schema ready           | `user_votes`, `predictions` tables                    |

### Fase 4 — Enhanced Features

| Feature                              | Priority | Notes                                                                |
| ------------------------------------ | -------- | -------------------------------------------------------------------- |
| Live stream section (IbaiLiveStream) | HIGH     | Component already exists `src/components/IbaiLiveStream.astro`       |
| Fight card ordering/timeline         | MEDIUM   | Currently fighters/combats data is static consts                     |
| View Transitions between pages       | MEDIUM   | Astro `ClientRouter` already configured                              |
| SEO per-page meta                    | MEDIUM   | Layout.astro has schema.org, but fighter/combat pages need their own |
| FAQ content expansion                | LOW      | Component exists, needs real data                                    |

---

## 3. Technical Considerations

### Astro Patterns In Use

- **Server rendering**: `output: 'server'` with Vercel adapter — all pages SSR by default
- **Selective prerender**: `export const prerender = true` used on static pages (fighter/combat pages in `_old/`, home page)
- **View Transitions**: `ClientRouter` in Layout.astro for smooth page transitions
- **Island architecture**: Countdown, BoxerClipPlayerCard use `<script>` hydration via `astro:page-load`
- **Content**: All fighter/combat/artist data in TypeScript consts (`src/consts/`) — NOT content collections

### SSR + Islands Patterns

```astro
<!-- Static prerendered page -->
export const prerender = true
export const getStaticPaths = () => FIGHTERS.map(f => ({ params: { id: f.id } }))
```

```astro
<!-- SSR dynamic route -->
export const prerender = false  // default with output: 'server'
const session = await getSession(Astro.request)
```

### Key Architectural Decisions

1. **Data source**: Static TS consts for fighters/combats/artists. Turso DB only for user-generated prediction data. This is the right call — keeps content static/CDN-cacheable.
2. **Predictions cache**: 30-second in-memory cache in `lib/predictions.ts` — good for high-traffic event day.
3. **Auth**: auth-astro configured but unused — needs `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` env vars.
4. **No content collections**: Data is plain TypeScript objects. Fine for this use case but less type-safe than content collections.
5. **API routes**: All in `src/pages/api/*.ts` — standard Astro SSR pattern.

### Turso/LibSQL Schema (from code analysis)

```sql
-- predictions table (aggregate vote counts per combat/fighter)
CREATE TABLE predictions (
  id TEXT PRIMARY KEY,
  combat_id TEXT NOT NULL,
  fighter_id TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
)

-- user_votes table (individual user votes, one per user per combat)
CREATE TABLE user_votes (
  id TEXT PRIMARY KEY,
  combat_id TEXT NOT NULL,
  fighter_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT
)
```

### Gaps in Data Architecture

1. No "edition" field — fighters.ts and combats.ts assume single edition. Velada VI data overwrites V.
2. No "winner" field validation — some fighters have `winner` declared, some don't.
3. No "event status" enum — can't programmatically distinguish "upcoming" vs "completed".
4. Fighters have `weight` but no `weightClass` — useful for grouping.

---

## 4. Design Opportunities

### Visual Differentiation (vs generic AI aesthetics)

The current design is already **distinctive**:

- ✅ Cinzel serif font (not Inter/Roboto)
- ✅ `#0a1024` deep navy + `#c7a86b` gold (not purple/blue gradient)
- ✅ Flip-clock countdown (unique, memorable)
- ✅ Dark synthwave aesthetic with neon glow effects

### Animation Opportunities

| Effect                        | Where                | Implementation                            |
| ----------------------------- | -------------------- | ----------------------------------------- |
| Fighter reveal on scroll      | `/luchador/[id]`     | Intersection Observer, stagger animations |
| Countdown flip animation      | Already exists       | `Date.astro` flip animation               |
| Hero image fade-in            | `index.astro`        | Already exists with JS                    |
| Versus card animation         | `CombatVersus.astro` | Already exists                            |
| Entry animations for sections | Home page            | `animate-fade-in-up` classes              |
| Live pulse effect             | Live stream section  | CSS animation for "LIVE" badge            |

### Design Gaps to Fill

1. **No mobile-specific fighter detail layout** — the `_old/luchador/[id]` is mostly desktop-focused (two-column)
2. **No dark/light mode** — all dark. Consistent but no toggle.
3. **No micro-interactions on fighter cards** — BoxerCard could have hover effects
4. **No animated background beyond static hero** — could add subtle particle/grid effects

---

## 5. Content Strategy for Velada VI

### Data Updates Required

| Data               | Current (Velada V)          | Needed (Velada VI)                                                                              |
| ------------------ | --------------------------- | ----------------------------------------------------------------------------------------------- |
| Event date         | July 2025                   | July 25, 2026 ✅ (already set in index.astro)                                                   |
| Event venue        | Estadio Cartuja, Sevilla    | ✅ (already correct)                                                                            |
| Fighters           | 14 (Velada V)               | 14 (Velada VI — new roster needed)                                                              |
| Combats            | 7 (Velada V)                | 7 (Velada VI — new matchups needed)                                                             |
| Artists            | 7 (Velada VI — already set) | ✅ (need to verify Aitana, Delarose, Eladio, Grupo Frontera, Los Del Río, Melendi, Myke Towers) |
| Sponsors           | 12 (Velada V)               | Update for Velada VI                                                                            |
| OG image           | Velada V                    | New Velada VI hero image                                                                        |
| Schema.org JSON-LD | Wrong date/location         | Update to 2026-07-25, Teatro Victoria → Cartuja                                                 |
| Entradas status    | Agotadas                    | Update CTA                                                                                      |

### Fighter Data Completeness (Velada VI)

All 14 fighters in `fighters.ts` have:

- ✅ `id`, `name`, `bio`, `realName`, `gender`
- ✅ `birthDate`, `height`, `age`, `weight`, `country`
- ✅ `gallery: true`, `city`
- ✅ `socials[]` with follower counts
- ✅ `clips[]` with YouTube clip URLs
- ✅ `workout` with videoID and thumbnail
- ✅ `versus` linking to opponent

⚠️ **NOTE**: The data says "Velada V" in descriptions but "Velada VI" in titles. Need to verify this is actually Velada VI data or if fighters.ts still contains Velada V content that needs replacement.

### Critical Content Questions

1. Are these the actual Velada VI fighters or the Velada V roster that needs replacing?
2. Who are the Velada VI headliners/main event fighters?
3. What new Velada VI-specific imagery exists vs what's reused?
4. What is the Velada VI tagline/campaign theme?

---

## 6. Performance Considerations

### Current Performance Profile

- **Static assets**: Fonts preloaded, AVIF/WebP with fallbacks, `fetchpriority="high"` on hero
- **CSS**: Inline `is:inline` for critical CSS, `inlineStylesheets: 'always'` build option
- **JavaScript**: Minimal JS, only for countdown and interactive islands
- **Images**: Lazy loading, optimized URLs, blur placeholders via `OptimizedImage`
- **Third-party**: YouTube embeds via `LiteYouTube`, Vercel Analytics

### Performance Opportunities

| Area           | Current                   | Opportunity                                    |
| -------------- | ------------------------- | ---------------------------------------------- |
| Fighter images | Full-res on luchador page | `srcset` + responsive images                   |
| YouTube embeds | LiteYouTube (good)        | Could add click-to-load for non-critical clips |
| Fonts          | 7 Cinzel variants loaded  | Could subset to used characters                |
| Sponsors logos | Inline SVG                | Already optimized                              |
| Countdown JS   | Runs on every page        | Could be Astro island with `client:idle`       |

### Vercel-Specific

- Using `@astrojs/vercel` adapter with SSR
- Vercel Analytics already integrated in Layout
- Consider Vercel Image Optimization for automatic WebP/AVIF
- Edge caching for static pages via `prerender = true`

---

## 7. Key Risks

1. **Missing fighter/combat images** — Critical blocker. All `/images/fighters/*` paths referenced in code don't exist in `public/`.
2. **Data accuracy** — fighters.ts may still be Velada V data (bios reference "Velada V", combat dates say "26 de julio"). Need confirmation.
3. **Auth integration** — auth-astro configured but not wired into any page. The porra page references it but needs working integration.
4. **API route missing** — `/api/predictions` is in `_old/` and needs to be an active SSR route for voting to work.
5. **Schema.org mismatch** — JSON-LD in Layout.astro says "Teatro Victoria, Barcelona" with wrong date (2026-03-09). Should match actual event.
6. **Broken transitions** — `transition:name` attributes used on fighter images in `_old/` pages but home page doesn't define corresponding `transition:name` for the Artists/Fighters sections.
7. **Vercel ISR vs SSR** — With `output: 'server'`, all pages are SSR unless explicitly prerendered. This means higher cold-start latency unless using Vercel's ISR.

---

## 8. Priority Order for Implementation

### Week 1: Core Pages

1. Migrate `src/pages/_old/luchador/[id].astro` → `src/pages/luchador/[id].astro`
2. Create `src/pages/combates/index.astro` (fight card listing)
3. Migrate `src/pages/_old/combates/[id].astro` → `src/pages/combates/[id].astro`
4. Add navigation links from home to fighter/combat pages
5. Add Header nav links

### Week 2: Porra + API

6. Create `src/pages/api/predictions.ts` (SSR API route)
7. Migrate `src/pages/_old/porra.astro` → `src/pages/porra.astro`
8. Integrate auth-astro into porra page
9. Connect porra to working API

### Week 3: Content + Polish

10. Add all missing fighter/combat/artist images
11. Update Schema.org JSON-LD for Velada VI
12. Update OG image
13. Add live stream section (IbaiLiveStream component ready)
14. Verify/fix View Transitions between pages

### Week 4: Launch Prep

15. SEO per-page meta tags
16. Performance audit
17. Mobile testing
18. Sponsor logo updates for Velada VI
