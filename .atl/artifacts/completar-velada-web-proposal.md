# Proposal: completar-velada-web

## Intent

Complete the La Velada del Año VI website to serve as a fully functional, impressive portfolio piece. The site already has Velada VI branding (July 25, 2026, Estadio La Cartuja Sevilla) and a hero/countdown, but all fighter/combat data references Velada V. This change migrates content, activates dynamic pages, seeds the predictions system, and adds polish features.

## Scope

### In Scope

- Velada VI fighter roster (16 fictional/future-proof fighters, similar profile to current creators)
- Velada VI combat card (7 fights with realistic pairings)
- Migrate `/luchador/[id]` page from `_old/` with Velada VI data
- Migrate `/combates` and `/combates/[id]` pages from `_old/` with Velada VI data
- Fighter gallery section on home page
- Predictions system seed data (new fighter IDs in Turso/LibSQL)
- Schema.org + SEO metadata update (date, location, event name)
- Visual polish: CSS animations, View Transitions, micro-interactions
- PWA manifest + service worker (offline shell, install prompt)
- Fighter image placeholders (AI-generated via placeholder service)

### Out of Scope

- New fighter/combat APIs (reuse existing `GET /api/predictions`, `POST /api/predictions`)
- New auth flow (reuse existing auth-astro setup)
- Content redesign of existing sections (Header, Hero, Sponsors, Footer — keep as-is)
- Analytics beyond existing Vercel Analytics

## Approach

**Architecture**: Astro 5.18 SSR with Vercel adapter, islands pattern, Tailwind v4. Reuse all existing infrastructure (auth-astro, Turso/LibSQL, existing components).

**Data**: Replace Velada V fighters/combats in `src/consts/fighters.ts` and `src/consts/combats.ts` with Velada VI roster. Fighter IDs are stable keys (e.g., `vegetta777`, `auronplay`). Image paths follow existing convention: `/images/fighters/big/{id}.webp`.

**Routing**: Move fighter/combat pages from `_old/` to `src/pages/`. Migrate from `getStaticPaths` + `prerender = true` to SSR (`export const prerender = false` — required for auth-astro session access on predictions pages).

**Images**: Use `picsum.photos` or `ui-avatars.com` for realistic placeholder portraits. Gallery images from curated Unsplash URLs. All via existing `OptimizedImage` component pattern.

**PWA**: Add `public/manifest.json` + `public/sw.js`. Astro handles service worker via `<script>` in Layout.

**Predictions DB**: Run `pnpm db:init` with new fighter IDs. Seed votes via `scripts/init-predictions-db.mjs` updated with Velada VI combat/fighter IDs.

## Affected Areas

| Area                              | Impact   | Description                                        |
| --------------------------------- | -------- | -------------------------------------------------- |
| `src/consts/fighters.ts`          | Modified | Replace 16 Velada V fighters with Velada VI roster |
| `src/consts/combats.ts`           | Modified | Replace 7 Velada V combats with Velada VI card     |
| `src/types/fighters.ts`           | Modified | Add new fighter IDs to union type                  |
| `src/pages/luchador/[id].astro`   | Migrated | Move from `_old/`, update data references          |
| `src/pages/combates/index.astro`  | Migrated | Move from `_old/`, update data references          |
| `src/pages/combates/[id].astro`   | Migrated | Move from `_old/`, update data references          |
| `src/pages/index.astro`           | Modified | Add fighter gallery section, PorraHome             |
| `src/layouts/Layout.astro`        | Modified | Add Schema.org date (July 25 2026), PWA meta       |
| `scripts/init-predictions-db.mjs` | Modified | Seed Velada VI predictions data                    |
| `public/manifest.json`            | New      | PWA manifest                                       |
| `public/sw.js`                    | New      | Service worker for offline shell                   |
| `public/images/fighters/`         | New      | Fighter placeholder images                         |

## Risks

| Risk                                         | Likelihood | Mitigation                                                    |
| -------------------------------------------- | ---------- | ------------------------------------------------------------- |
| Image service rate limits                    | Med        | Use deterministic seed URLs; fallback to CSS gradient avatars |
| SSR + prerender conflict on new pages        | Low        | Set `prerender = false` on all migrated routes                |
| Auth-astro session in SSR context            | Low        | Use `getSession()` server-side; existing pattern validated    |
| Predictions DB schema mismatch after re-seed | Med        | Clear existing tables before re-seed in init script           |

## Rollback Plan

1. Revert `src/consts/fighters.ts` and `src/consts/combats.ts` to previous git commit
2. Move fighter/combat pages back to `_old/`
3. Re-run `pnpm db:init` to restore Velada V seed data
4. Remove PWA files (`public/manifest.json`, `public/sw.js`)
5. Revert `src/layouts/Layout.astro` Schema.org date

## Dependencies

- `pnpm db:init` — seed new predictions data before deploying
- External: picsum.photos or Unsplash for placeholder fighter images (no API key required)
- Vercel env vars for Turso (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`) already configured

## Success Criteria

- [ ] `/luchador/[id]` renders all 16 Velada VI fighters with profile, bio, clips, gallery
- [ ] `/combates` renders full fight card (7 combats) with predictions bars
- [ ] `/combates/[id]` renders individual combat with stats, YouTube video, prediction vote
- [ ] Home page shows Velada VI logo, countdown, and fighter gallery section
- [ ] `pnpm db:init` seeds predictions for all 7 Velada VI combats
- [ ] PWA installs on mobile (manifest + service worker)
- [ ] `pnpm build` succeeds with no TypeScript errors
- [ ] `pnpm lint` passes
- [ ] Vercel deployment green with SSR routes working
