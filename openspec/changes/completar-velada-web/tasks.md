# Tasks: completar-velada-web

## Phase 1: Data & Foundation

- [ ] 1.1 **Update `src/consts/fighters.ts`** — Replace all 14 fighters with Velada VI roster. Set `winner: null` in combats later. Preserve component structure. Each fighter needs: id, name, realName, bio, gender, birthDate, height, weight, country, city, versus, gallery, socials, clips, workout.
- [ ] 1.2 **Update `src/consts/combats.ts`** — Replace all 7 combats with Velada VI card. Set `winner: null` on every combat (pre-event). Update fighter IDs to match new Velada VI fighters.
- [ ] 1.3 **Update `src/consts/artists.ts`** — Replace all 7 artists with Velada VI lineup. Update `image` paths to `/images/artists/[id].webp`.
- [ ] 1.4 **Update `src/consts/sponsors.ts`** — Replace sponsors with Velada VI sponsors if changed.
- [ ] 1.5 **Fix `src/layouts/Layout.astro` JSON-LD** — Change `startDate` to `2026-07-25T20:00:00+02:00`. Change venue `name` to `Estadio La Cartuja`, `addressLocality` to `Sevilla`, `addressRegion` to `Andalucía`.
- [ ] 1.6 **Fix `src/layouts/Layout.astro` OG image** — Verify `og:image` and `twitter:image` reference the correct La Velada VI asset path.
- [ ] 1.7 **Create `src/lib/auth.ts`** — Implement `getUserId(session)` helper: returns `session?.user?.id` if authenticated, otherwise generates/reads anonymous UUID from cookie.
- [ ] 1.8 **Create `src/pages/api/predictions.ts`** — SSR endpoint with `GET` (fetch predictions from Turso) and `POST` (register vote via `registerVote()`). Accept `{ combatId, fighterId }` in body, `userId` from cookie.

## Phase 2: Pages & Routes

- [ ] 2.1 **Move `src/pages/_old/luchador/[id].astro` → `src/pages/luchador/[id].astro`** — Remove `getStaticPaths()` and `prerender = true`. Set `prerender = false` for SSR. Update fighter bio references to Velada VI.
- [ ] 2.2 **Move `src/pages/_old/combates/index.astro` → `src/pages/combates/index.astro`** — Remove `prerender = true`. Set `prerender = false` for SSR. Verify PredictionBar integration.
- [ ] 2.3 **Move `src/pages/_old/combates/[id].astro` → `src/pages/combates/[id].astro`** — Remove `getStaticPaths()` and `prerender = true`. Set `prerender = false` for SSR.
- [ ] 2.4 **Move `src/pages/_old/porra.astro` → `src/pages/porra.astro`** — Keep `getSession()` call. Verify auth-astro integration. Ensure prediction vote buttons call `/api/predictions`.
- [ ] 2.5 **Create `src/pages/artists.astro`** — SSG page displaying all 7 artists using `ArtistCard.astro`. Prerender = true.
- [ ] 2.6 **Create `src/pages/api/auth/[...auth].ts`** — Auth.js handler for auth-astro, wiring up the login provider.
- [ ] 2.7 **Create `src/components/CombatCard.astro`** — New component for `/combates` listing. Shows both fighters' images, VS graphic, combat number, links to `/combates/[id]`. Main event (index 0) gets full-width treatment.
- [ ] 2.8 **Create `src/components/PredictionVoteButton.astro`** — Interactive island with `client:load`. Accepts `combatId`, `fighterId`, `userVote`. Calls `/api/predictions` POST on click. Shows selected state.
- [ ] 2.9 **Update `src/pages/index.astro`** — Add fighters showcase (grid of all 14 `BoxerCard` components linking to `/luchador/[id]`), combats preview (top 3 combats), artists section (horizontal scroll of `ArtistCard`), sponsors section. Add `Navigation.astro` header.

## Phase 3: Navigation & Layout

- [ ] 3.1 **Create `src/components/Navigation.astro`** — Responsive header with links to `/`, `/combates`, `/luchador/[id]` (maybe dropdown), `/artists`, `/porra`. Hamburger menu on mobile. Use existing theme colors (--color-theme-midnight, --color-theme-gold).
- [ ] 3.2 **Add `Navigation.astro` to `src/layouts/Layout.astro`** — Insert before `<main>`. Ensure skip-to-content link is first focusable element.
- [ ] 3.3 **Update `src/layouts/Layout.astro`** — Add `PWA manifest` meta: `<link rel="manifest" href="/manifest.json">`. Add theme-color meta.
- [ ] 3.4 **Update `src/pages/index.astro` footer** — Ensure sponsors section uses `SponsorCard` or inline logos linking to sponsor URLs with `target="_blank" rel="noopener noreferrer"`.
- [ ] 3.5 **Add FAQ section to `src/pages/index.astro`** — Import and use `FAQ.astro` component if not already present. Add below sponsors.

## Phase 4: Images & Placeholders

- [ ] 4.1 **Create `src/lib/image-fallback.ts`** — Implement `getFighterImage(type, id)` returning path or placeholder SVG data URI for missing images.
- [ ] 4.2 **Add `onerror` fallback to `src/components/OptimizedImage.astro`** — On error, swap src to a generic SVG silhouette or CSS gradient div.
- [ ] 4.3 **Add `onerror` fallback to `src/components/ArtistCard.astro`** — On image error, show placeholder div with artist name in Cinzel font, no broken-image icon.
- [ ] 4.4 **Add `onerror` fallback to `src/components/BoxerCard.astro`** — Swap to generic placeholder SVG on image load failure.
- [ ] 4.5 **Add `onerror` fallback to `src/components/BoxerWorkout.astro`** — Handle missing `/images/fighters/workoutThumbnails/[id]-thumbnail.webp`.
- [ ] 4.6 **Add `onerror` fallback to `src/components/LiteYouTube.astro`** — Fall back to dark gradient background when `/images/combates/[id].webp` is missing.
- [ ] 4.7 **Create placeholder SVG fighter portraits** — For each Velada VI fighter, create a simple silhouette SVG in `public/images/fighters/`. Use deterministic placeholder service (picsum.photos or ui-avatars.com) as `onerror` fallback.

## Phase 5: Animations & Polish

- [ ] 5.1 **Add staggered entry animations to `src/pages/index.astro`** — Apply `animate-fade-in` with incremental delays to fighter cards and combat cards on scroll entry using CSS.
- [ ] 5.2 **Add scroll-triggered animations** — Use `@keyframes` + `animation-timeline: view()` on fighter cards, combat cards, and artist cards. Ensure graceful degradation with `@supports`.
- [ ] 5.3 **Add micro-interactions** — Hover scale/glow on `BoxerCard`, `CombatCard`, `ArtistCard`. Gold border on hover for prediction vote buttons.
- [ ] 5.4 **Add View Transitions** — Add `transition:name` on fighter portrait images and VS graphics in `CombatVersus.astro` for page morphing between `/luchador/[id]` and `/combates/[id]`.
- [ ] 5.5 **Create `public/manifest.json`** — PWA manifest with name, icons, theme_color (#0a1024), start_url, display: standalone.
- [ ] 5.6 **Create `public/sw.js`** — Service worker with cache-first strategy for static assets (fonts, images), network-first for HTML pages.
- [ ] 5.7 **Polish scrollbar** — Ensure gold thumb on dark track via `global.css` for all browsers.

## Phase 6: Testing & Build

- [ ] 6.1 **Run `pnpm build`** — Fix all TypeScript errors. Verify `strict` mode passes.
- [ ] 6.2 **Run `pnpm lint`** — Fix any ESLint errors.
- [ ] 6.3 **Test `/` route** — Verify hero, fighters showcase, combats preview, artists section, sponsors all render correctly.
- [ ] 6.4 **Test `/luchador/[id]`** — Navigate to each fighter profile. Verify bio, clips, workout video, gallery, opponent card, combat section.
- [ ] 6.5 **Test `/combates`** — Verify all 7 combats listed in reverse order. Main event featured prominently. Prediction bars visible.
- [ ] 6.6 **Test `/combates/[id]`** — Verify CombatVersus, fighter stats comparison, YouTube embed, links to fighter profiles. Unknown ID redirects to `/404`.
- [ ] 6.7 **Test `/porra`** — Vote for a fighter. Refresh page — vote persists. Vote for different fighter — vote changes.
- [ ] 6.8 **Test `/artists`** — Verify all 7 artist cards render with images or fallbacks.
- [ ] 6.9 **Verify SEO** — Check JSON-LD Schema.org on homepage (La Velada VI, Estadio La Cartuja, July 25 2026). Check og:image, twitter:image, canonical URLs on all pages.
- [ ] 6.10 **Responsive check** — Test on mobile viewport (375px), tablet (768px), desktop (1280px). Verify navigation hamburger menu works.
- [ ] 6.11 **Verify 404 page** — Navigate to `/luchador/nonexistent` and `/combates/fake` — should show 404 page.
