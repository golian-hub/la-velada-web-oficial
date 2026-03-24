# La Velada VI — Website Completion Spec

**Change:** completar-velada-web  
**Stack:** Astro 5.18 SSR + Vercel, Tailwind v4, TypeScript strict  
**Mode:** openspec — FULL spec (no prior spec exists)

---

## 1. Purpose

Complete the La Velada VI website (July 25, 2026, Estadio La Cartuja, Sevilla) from a hero-only state to a full-featured event site. All existing data references Velada V; fighters, combats, artists, and sponsors must be updated for Velada VI.

---

## 2. Domain: pages

### Req: F1 — Homepage (`/`)

The homepage (`src/pages/index.astro`) MUST display the event hero section as-is. A new **fighters showcase** section MUST be added below the hero showing all 14 fighters with cards linking to `/luchador/[id]`. A **combats preview** section MUST show all 7 combats in reverse chronological order. The **artists lineup** section MUST display all 7 musical artists. The **sponsors footer** MUST display all 12 sponsors.

#### Scenario: Fan browses homepage

- GIVEN a visitor lands on `/`
- WHEN the page loads
- THEN they see the countdown to July 25, 2026, 20:00 CET, the event logo, and the venue
- AND a grid of all fighter cards
- AND a list of all combats (main event highlighted)
- AND the artist lineup
- AND the sponsors section

#### Scenario: Homepage SSR with prerender

- GIVEN the site is deployed on Vercel with SSR output mode
- WHEN a visitor requests `/`
- THEN the page MAY be prerendered (`export const prerender = true`) for CDN caching
- OR the page MAY be server-rendered on each request

### Req: F2 — Fighter Profile (`/luchador/[id]`)

A dynamic route MUST serve individual fighter profiles. The page MUST render at `src/pages/luchador/[id].astro`. Each fighter page MUST show: portrait image, name in decorative text, profile card (stats: age, height, weight, country, city), bio, social links, clips list, workout video, gallery, opponent card, and their combat.

#### Scenario: Fan views a fighter profile

- GIVEN a visitor navigates to `/luchador/grefg`
- WHEN the page loads
- THEN they see Grefg's portrait, bio, social links, clips, workout video, and an opponent card linking to Westcol's profile
- AND a CombatVersus section showing their fight

#### Scenario: Unknown fighter ID

- GIVEN a visitor navigates to `/luchador/nonexistent`
- WHEN `getBoxerById` returns undefined
- THEN the server MUST redirect to `/404`

### Req: F3 — Combats Listing (`/combates`)

A new page at `src/pages/combates/index.astro` MUST list all 7 combats in reverse order (main event first). Each combat card MUST show both fighters' images, the VS graphic, combat number, and link to `/combates/[id]`.

#### Scenario: Fan browses all combats

- GIVEN a visitor navigates to `/combates`
- WHEN the page loads
- THEN they see all 7 combats listed with the main event (Grefg vs Westcol) featured prominently
- AND each combat is clickable, navigating to its detail page

### Req: F4 — Combat Detail (`/combates/[id]`)

A dynamic route at `src/pages/combates/[id].astro` MUST render individual combat pages. Each page MUST show: CombatVersus component, both fighters' stats (age, height, weight, country), embedded YouTube video, and a link to each fighter's profile.

#### Scenario: Fan views a combat detail

- GIVEN a visitor navigates to `/combates/7-grefg-vs-westcol`
- WHEN the page loads
- THEN they see the full CombatVersus display, fighter comparison stats, and the YouTube fight video
- AND navigation links to each fighter's profile

#### Scenario: Unknown combat ID

- GIVEN a visitor navigates to `/combates/fake-combat`
- WHEN `COMBATS.find` returns undefined
- THEN the server MUST redirect to `/404`

### Req: F5 — 404 Page

The existing `src/pages/404.astro` (`prerender = true`) MUST remain functional and styled. It MUST show the "¡FUERA DE COMBATE!" message with a link back to `/`.

#### Scenario: Visitor hits a dead route

- GIVEN a visitor navigates to a non-existent route like `/luchadores` or `/combates/fake`
- WHEN the page is not found
- THEN they are shown the 404 page
- AND the page title reflects "404 - La Velada del Año VI"
- AND a "Volver al ring" button links to `/`

---

## 3. Domain: fighters

### Req: FTR1 — Fighter Data Structure

All 14 fighters are defined in `src/consts/fighters.ts`. Each fighter MUST have: `id`, `name`, `realName`, `bio`, `gender`, `birthDate`, `height` (meters), `weight` (kg), `country` (ISO code), `city`, `versus` (opponent id), `gallery` (boolean), optional `fightName`, optional `targetWeight`, optional `targetGloves`, `socials` array, `clips` array, and optional `workout` object.

The `versus` field MUST correctly reference the opponent's `id` from the updated combats list.

### Req: FTR2 — Fighter Card

The `BoxerCard.astro` component MUST display a fighter's name and image, linking to `/luchador/[id]`. When `versus` prop is provided, it MUST show a highlight/glow effect indicating the rivalry state.

#### Scenario: Fighter card in grid

- GIVEN `BoxerCard` is rendered with `id="grefg"`, `name="TheGrefg"`, `versus="westcol"`
- WHEN the card is displayed
- THEN it shows TheGrefg's image with a rivalry glow effect
- AND clicking it navigates to `/luchador/grefg`

### Req: FTR3 — Fighter Profile Card

`BoxerProfileCard.astro` MUST display: name, fightName (if present), realName, age, height, weight, country flag, city, and gender category.

### Req: FTR4 — Fighter Social Links

`BoxerSocialLink.astro` MUST render clickable icons for each social platform (Instagram, TikTok, YouTube, X, Twitch, Kick). Each link MUST open in a new tab with proper `rel="noopener noreferrer"`.

### Req: FTR5 — Fighter Clips

`BoxerClipList.astro` MUST display all clips with text quotes and thumbnail. `BoxerClipDrawer.astro` MUST provide an expandable drawer for viewing clips. `BoxerClipPlayerCard.astro` MUST embed YouTube clips with LiteYouTube.

### Req: FTR6 — Fighter Workout Video

`BoxerWorkout.astro` MUST embed the workout video using the fighter's `workout.videoID` via `LiteYouTube.astro`. The thumbnail MUST reference `/images/fighters/workoutThumbnails/[id]-thumbnail.webp`.

### Req: FTR7 — Fighter Gallery

`BoxerGallery.astro` MUST display a photo gallery for fighters with `gallery: true`. Images MUST be served from `/images/fighters/gallery/[id]/`. The gallery MUST handle missing images gracefully.

#### Scenario: Gallery with missing images

- GIVEN a fighter has `gallery: true` but no images exist
- WHEN the gallery renders
- THEN it MUST show a fallback placeholder or empty state
- AND NOT throw a runtime error

---

## 4. Domain: combats

### Req: CMB1 — Combat Data Structure

All 7 combats are defined in `src/consts/combats.ts`. Each combat MUST have: `id`, `number`, `fighters` (array of 2 fighter IDs), `title`, `video` (YouTube video ID), `winner` (fighter ID — used to show result), `description`.

The `winner` field MUST be set to `null` or an empty string for combats that have not yet occurred (pre-event). Once results are known, `winner` MUST be updated.

#### Scenario: Pre-event combat data

- GIVEN a combat has not yet occurred
- WHEN the combat page renders
- THEN the `winner` field MUST be `null` or omitted
- AND the page MUST NOT display a "WINNER" badge

#### Scenario: Post-event combat data

- GIVEN a combat has been decided
- WHEN the combats listing renders
- THEN the winning fighter's image MUST display a gold "VICTORIA" badge
- AND the winner's portrait gets a gold aura filter

### Req: CMB2 — Combat Listing Order

`/combates` MUST display combats in reverse chronological order (combat #7 first, combat #1 last). The main event (highest number) MUST be visually featured with larger card size and full width.

### Req: CMB3 — CombatVersus Component

`CombatVersus.astro` MUST display both fighters side by side with their images and names, plus a VS graphic. It MUST accept an `id` prop to look up the combat from `COMBATS`. The component MUST support transition names for view transitions.

### Req: CMB4 — Combat Video Embed

The combat detail page MUST embed the YouTube video via `LiteYouTube.astro` using the combat's `video` field as `videoId`. The background thumbnail MUST reference `/images/combates/[id].webp`.

### Req: CMB5 — Combat Stats Comparison

The combat detail page MUST display a 3-column comparison: left fighter stats, labels (EDAD, ALTURA, PESO, PAÍS), right fighter stats. Stats MUST include age, height, weight, and country flag.

---

## 5. Domain: artists

### Req: ART1 — Artist Data Structure

All 7 artists are defined in `src/consts/artists.ts`. Each artist MUST have: `id`, `name`, `image` (path to `/images/artists/[id].webp`).

### Req: ART2 — Artist Cards

`ArtistCard.astro` MUST display an artist card with their image and name. The homepage artists section MUST use this component.

### Req: ART3 — Artist Image Fallback

When `/images/artists/[id].webp` does not exist, the component MUST render a placeholder with the artist's name in Cinzel font and a dark background, with no broken-image icon.

#### Scenario: Missing artist image

- GIVEN `ArtistCard` renders an artist with no corresponding image file
- WHEN the image fails to load
- THEN an `onerror` handler MUST replace the src with a placeholder SVG
- AND the card MUST still display the artist's name

---

## 6. Domain: sponsors

### Req: SPN1 — Sponsor Data Structure

All 12 sponsors are defined in `src/consts/sponsors.ts`. Each sponsor MUST have: `id`, `name`, `url`, `label` (accessibility text), and `image.logo` (SVG import).

### Req: SPN2 — Sponsor Display

The homepage MUST display all 12 sponsors in a horizontal scroll or grid layout at the bottom. Each sponsor logo MUST link to their `url` with `target="_blank" rel="noopener noreferrer"`.

---

## 7. Domain: ui

### Req: UI1 — Countdown Timer

The countdown on `/` MUST count down to July 25, 2026, 20:00:00+02:00. The `countdown.ts` library MUST handle days, hours, minutes, seconds. When the event passes, the timer MUST display "00:00:00:00" or a configurable message.

### Req: UI2 — OptimizedImage

`OptimizedImage.astro` MUST handle responsive images with `<picture>` tag for AVIF/WebP sources. Missing image files MUST NOT crash the page; a fallback `onerror` handler MUST be implemented.

### Req: UI3 — LiteYouTube Embed

`LiteYouTube.astro` MUST provide a lightweight YouTube embed that loads the YouTube iframe only on interaction. It MUST accept `videoId`, `title`, and optional `backgroundImage` props.

### Req: UI4 — Prediction Bar

`PredictionBar.astro` MUST display vote percentages for each fighter in a combat. The component MUST call `getPredictionsForPage()` from `lib/get-predictions-for-page.ts` to fetch Turso DB data.

#### Scenario: Turso DB unavailable

- GIVEN the Turso database is unreachable
- WHEN `getPredictionsForPage` fails
- THEN the PredictionBar MUST display fallback static percentages (as hardcoded in the legacy pages)
- AND MUST NOT crash or show an error to the user

### Req: UI5 — FAQ Section

`FAQ.astro` MUST display a collapsible FAQ section. The component SHOULD be used on the homepage.

### Req: UI6 — Scroll Animations

All pages MUST use `@keyframes` and `animation-timeline: view()` for scroll-triggered animations where supported. Animations MUST degrade gracefully in browsers without scroll-driven animation support.

---

## 8. Edge Cases & Error Handling

### Req: E1 — Missing Fighter Images

All fighter image references (`/images/fighters/big/[id].webp`, `/images/fighters/text/[id].webp`, `/images/fighters/combat/[id].webp`) MUST have `onerror` handlers that swap to a placeholder. The `/images/fighters/workoutThumbnails/[id]-thumbnail.webp` MUST also have error fallbacks.

#### Scenario: Missing fighter portrait

- GIVEN a fighter's portrait at `/images/fighters/big/grefg.webp` does not exist
- WHEN the image loads and fails
- THEN an `onerror` handler MUST swap to a generic silhouette placeholder
- AND the page MUST continue rendering normally

### Req: E2 — Missing Combat Background Image

`LiteYouTube` background at `/images/combates/[id].webp` MUST have an `onerror` fallback to a solid dark gradient background.

### Req: E3 — SSR Redirect Behavior

Dynamic routes using `Astro.redirect('/404')` MUST be called before any output is sent. With Vercel SSR, this works correctly. If prerendering dynamic routes, `getStaticPaths` MUST return all fighter and combat IDs.

### Req: E4 — Type Safety

All data constants MUST use TypeScript interfaces from `src/types/`. The `Fighters`, `Combat`, `Artist`, `Sponsors` interfaces MUST be complete and match the actual data shapes. `as const` assertions MUST be used on all constant arrays.

### Req: E5 — SEO & Meta

Each page MUST set: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`), and Twitter Card tags. The JSON-LD schema in `Layout.astro` MUST be updated to reflect La Velada VI details ( Estadio La Cartuja, July 25 2026).

---

## 9. Performance

### Req: P1 — Image Optimization

All hero and background images MUST use AVIF and WebP sources via `<picture>`. Hero background (`/background.avif`, `/background.webp`) MUST have `fetchpriority="high"` and `decoding="async"`.

### Req: P2 — Prerendering

Given SSR mode, critical pages (`/` with fighter showcase, `/combates`) MAY be prerendered for better Vercel Edge caching. Dynamic routes (`/luchador/[id]`, `/combates/[id]`) MAY use ISR (Incremental Static Regeneration) if supported by the Vercel adapter, or fallback to on-demand SSR.

### Req: P3 — Client Hydration

Components with client-side interactivity (countdown timer, FAQ accordion, PredictionBar client-side fetch) MUST use Astro's `client:load` or `client:visible` directives. The countdown timer MUST NOT block the initial render.

---

## 10. Design Tokens

All pages MUST use the established design system:

- **Colors:** `--color-theme-midnight: #0a1024`, `--color-theme-gold: #c7a86b`, `--color-theme-cream: #f4e4c9`, `--color-theme-navy: #142346`
- **Fonts:** Cinzel (headings), system-ui fallback
- **Scrollbar:** Gold thumb on dark track
- **Animations:** `@keyframes` with `animate-*` classes, scroll-driven animations with `animation-timeline: view()`
- **Accessibility:** Skip-to-content link, ARIA labels, focus states, semantic HTML

---

## 11. Content Update Requirements

The following constants MUST be updated for Velada VI:

| Constant               | Action | Notes                                                                                                                                       |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `FIGHTERS`             | UPDATE | Replace with Velada VI fighters. Preserve existing component structure. IDs, bios, socials, clips, workout data must be Velada VI specific. |
| `COMBATS`              | UPDATE | Replace with Velada VI combats. Update `winner` to `null` (pre-event) or actual results.                                                    |
| `ARTISTS`              | UPDATE | Replace with Velada VI artists. Images may use placeholder strategy.                                                                        |
| `SPONSORS`             | UPDATE | Replace with Velada VI sponsors if changed.                                                                                                 |
| `pageTitles.ts`        | KEEP   | Already references "La Velada del Año VI".                                                                                                  |
| `Layout.astro` JSON-LD | UPDATE | Change venue to Estadio La Cartuja, date to July 25 2026.                                                                                   |
| `index.astro`          | UPDATE | Add fighters showcase, combats preview, artists section, sponsors section sections below hero.                                              |
