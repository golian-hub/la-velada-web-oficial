# Design: Completar La Velada VI Web

## Technical Approach

Build ON existing infrastructure — reuse `FIGHTERS[]`, `COMBATS[]`, `ARTISTS[]`, boxer components, `turso` DB client, and `auth-astro`. The site currently has a landing hero but no combats/fighters/porra pages. We add all missing pages with SSR for dynamic prediction voting and static prerendering where possible.

## Architecture Decisions

### Decision: Rendering Mode per Page Type

| Page               | Mode                      | Rationale                                   |
| ------------------ | ------------------------- | ------------------------------------------- |
| `/` (landing)      | SSG (`prerender = true`)  | Static hero, no dynamic data                |
| `/combates`        | SSR (`prerender = false`) | Needs real-time prediction counts           |
| `/combates/[id]`   | SSR                       | Combat images + live prediction bar         |
| `/luchador/[id]`   | SSG (static paths)        | Fighter data is static, images pre-rendered |
| `/porra`           | SSR                       | Auth state + user votes, needs session      |
| `/api/predictions` | SSR endpoint              | Dynamic DB writes                           |
| `/artists`         | SSG                       | Static artist data                          |

### Decision: Prediction System — Anonymous + Authenticated

**Choice**: Allow anonymous votes via session cookie, upgrade to auth-astro identity when available.
**Alternatives**: Require auth for all votes (rejected — friction), pure localStorage (rejected — no aggregation).
**Rationale**: Users can vote immediately; if they sign in later, votes associate to their account via `user_votes` table.

### Decision: Image Fallback Strategy

**Choice**: Check `/public/images/fighters/{type}/{id}.webp` → return SVG placeholder if missing → 404 → OptimizedImage shows styled fallback div.
**Alternatives**: Unsplash URLs (rejected — not brand-consistent), generate with Canvas API (rejected — too complex).
**Rationale**: Progressive enhancement — page works even if images are missing; assets can be added later.

### Decision: View Transitions

**Choice**: Use Astro's `<ClientRouter />` (already in Layout) for page transitions; add `transition:name` on fighter images and VS graphics for morphing between pages.
**Alternatives**: No transitions (rejected — loses polish), Framer Motion (rejected — adds JS weight).
**Rationale**: Native browser transitions, zero runtime JS, works with SSG.

## Data Flow

```
Browser ──→ Astro SSR Page ──→ Layout.astro ──→ Sections
                │                                    │
                ├─→ /api/predictions (GET/POST) ──→ Turso DB
                │
                └─→ getSession() ──→ auth-astro (Auth.js) ──→ Session Cookie
```

## File Changes

### New Pages (SSR)

| File                              | Action | Description                                 |
| --------------------------------- | ------ | ------------------------------------------- |
| `src/pages/combates/index.astro`  | Create | Combates listing with prediction bars       |
| `src/pages/combates/[id].astro`   | Create | Single combat detail + CombatVersus         |
| `src/pages/luchador/[id].astro`   | Create | Fighter profile (moves from `_old/`)        |
| `src/pages/porra.astro`           | Create | Prediction voting page (moves from `_old/`) |
| `src/pages/artists.astro`         | Create | Artists lineup page                         |
| `src/pages/api/predictions.ts`    | Create | GET (all/single) + POST (vote)              |
| `src/pages/api/auth/[...auth].ts` | Create | Auth.js handler                             |

### New Components

| File                                        | Action | Description                                                |
| ------------------------------------------- | ------ | ---------------------------------------------------------- |
| `src/components/PredictionVoteButton.astro` | Create | Interactive island — click to vote, requires `client:load` |
| `src/components/CombatCard.astro`           | Create | Combat card for listing page                               |
| `src/components/ArtistCard.astro` (enhance) | Modify | Already exists — verify it renders artist data             |

### New / Modified /lib Files

| File                                      | Action | Description                                                                                             |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `src/lib/predictions.ts` (already exists) | Modify | Already complete — verify `registerVote` works with both anonymous + auth userId                        |
| `src/lib/auth.ts`                         | Create | Helper: `getUserId(session)` → returns `session?.user?.id` or generates anonymous UUID stored in cookie |
| `src/lib/image-fallback.ts`               | Create | `getFighterImage(type, id)` → path or placeholder SVG                                                   |

### Turso Schema (assumed existing)

```sql
CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY,
  combat_id TEXT NOT NULL,
  fighter_id TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_votes (
  id TEXT PRIMARY KEY,
  combat_id TEXT NOT NULL,
  fighter_id TEXT NOT NULL,
  user_id TEXT NOT NULL,  -- Auth user ID or anonymous UUID
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(combat_id, user_id)
);
```

## Interfaces / Contracts

### API: GET /api/predictions

```ts
// Request: GET /api/predictions?combat_id=1-peereira-vs-rivaldios
// Response:
{
  combat_id: string,
  predictions: Array<{ fighter_id: string; votes: number; percentage: number }>,
  total_votes: number
}
```

### API: POST /api/predictions

```ts
// Request: POST /api/predictions
// Body: { combatId: string; fighterId: string }
// Headers: Cookie (session) + optional X-User-ID (anonymous UUID)
// Response: { combat_id, fighter_id, votes }
```

### Component: PredictionVoteButton

```astro
<PredictionVoteButton
  combatId="1-peereira-vs-rivaldios"
  fighterId="peereira"
  userVote={null | 'peereira' | 'rivaldios'}
  client:load
/>
```

## Testing Strategy

| Layer       | What                 | How                                        |
| ----------- | -------------------- | ------------------------------------------ |
| Unit        | `registerVote` logic | Vitest with mocked turso client            |
| Integration | API endpoints        | Playwright API calls against dev server    |
| E2E         | Full voting flow     | Playwright: vote → refresh → vote persists |
| Visual      | Prediction bars      | Screenshot diff per combat                 |

## Migration / Rollout

No migration required. Turso tables assumed pre-existing from La Velada V. New anonymous-vote path added to `registerVote` without breaking existing auth-based votes.

Deploy order:

1. API routes + DB schema validation
2. `/combates` + `/combates/[id]` pages
3. `/luchador/[id]` (move from `_old/`)
4. `/porra` (move from `_old/`)
5. `/artists` page
6. Image assets for La Velada VI

## Open Questions

- [ ] **Images**: Do La Velada VI fighter/combat images exist? Need asset list from content team.
- [ ] **Auth provider**: Which Auth.js provider for login? Discord? Google? Twitter?
- [ ] **Anonymous vote limit**: Should anonymous users be rate-limited? (Suggest 1 vote per combat per session, no persistence across browsers.)
- [ ] **Combat order**: Are the 7 combats in `combats.ts` correct for La Velada VI? The current data has `winner` fields (La Velada V data).
- [ ] **Event date**: The site says 25 July 2026. Confirm with organizers.
