<a name="readme-top"></a>

<div align="center">

<a href="https://www.infolavelada.com/" target="_blank" rel="noopener noreferrer">
  <img width="300px" src="https://github.com/user-attachments/assets/9cb3d500-8b37-400a-a983-6a6d1a9356a2" alt="Logo La Velada del Año VI" />
</a>

## Web oficial de La Velada del Año VI — Implementación completa

**Candidatura al puesto de Programador Web junto a Midudev e InfoJobs**

*Fork del [repo oficial de Midudev](https://github.com/midudev/la-velada-web-oficial) con todas las páginas y funcionalidades implementadas para La Velada VI*

</div>

---

<details>
<summary>Tabla de contenidos</summary>

- [¿Qué hay implementado?](#-qué-hay-implementado)
- [Páginas nuevas](#páginas-nuevas)
- [Sistema de predicciones (La Porra)](#sistema-de-predicciones-la-porra)
- [Optimizaciones de rendimiento](#optimizaciones-de-rendimiento)
- [Bugs corregidos](#bugs-corregidos)
- [Stack](#️-stack)
- [Cómo ejecutar](#cómo-ejecutar)
- [Roadmap](#roadmap)

</details>

---

## ¿Qué hay implementado?

El repo oficial actualmente tiene `index.astro` + `404.astro` con datos de La Velada V.

Esta implementación tiene **todo lo que falta** para La Velada VI listo para producción.

### Páginas nuevas

| Ruta | Descripción | Prerender |
|------|-------------|-----------|
| `/combates` | Listado de los 10 combates con cards animadas | ✅ Estático |
| `/combates/[id]` | Página individual con estadísticas comparativas (edad, altura, peso, país) | ✅ Estático |
| `/luchadores` | Directorio completo de los 20 luchadores de La Velada VI | ✅ Estático |
| `/luchador/[id]` | Perfil individual con stats, bio y radar chart | ✅ Estático |
| `/artists` | Los 7 artistas del evento | ✅ Estático |
| `/porra` | Sistema de predicciones con votación anónima en tiempo real | ❌ SSR |
| `/api/predictions` | API REST con caché y base de datos Turso | ❌ SSR |

### Los 20 luchadores confirmados de La Velada VI

```
MAIN EVENT      IlloJuan        vs  TheGrefg
CO-MAIN         YoSoyPlex       vs  Fernanfloo
                Viruzz          vs  Gero Arias
                Kidd Keo        vs  Lit Killah
                Marta Díaz      vs  Tatiana Kaer
                Samy Rivers     vs  Roro
                Clersss         vs  Natalia MX
                Alondrissa      vs  Angie Velasco
                Fabiana Sevillano vs La Parce
                Edu Aguirre     vs  Gastón Edul
```

---

## Sistema de predicciones (La Porra)

Funcional al 100% y listo para aguantar millones de votos.

**Base de datos: Turso (cloud SQLite)**

```sql
-- Votos agregados por combate y luchador
predictions (combat_id, fighter_id, votes) -- UNIQUE(combat_id, fighter_id)

-- Un voto por usuario por combate
user_votes (combat_id, fighter_id, user_id) -- UNIQUE(combat_id, user_id)
```

**Flujo completo:**

```
Usuario visita /porra
    │
    ├─ SSR: getAllPredictions() + getUserVotes(userId) → Turso
    │    └─ Página renderizada con datos reales (no 50%/50% hardcodeado)
    │
    └─ Click en luchador → POST /api/predictions
         ├─ Valida userId (UUID, HttpOnly cookie)
         ├─ Comprueba voto previo en user_votes
         ├─ turso.batch() → transacción atómica (evita race conditions)
         ├─ Invalida caché del combate
         └─ Respuesta → actualiza barras con animación CSS
```

**Optimizaciones para millones de peticiones:**
- Caché en memoria de 30 segundos en servidor — la mayoría de reads nunca tocan la DB
- `Cache-Control: public, max-age=30` en la API — el CDN de Vercel absorbe el tráfico
- Invalidación selectiva de caché solo del combate votado, no de todo

---

## Optimizaciones de rendimiento

Para aguantar el pico de tráfico del día del evento:

### Imágenes
- **AVIF → WebP → PNG** en todos los `<picture>` — AVIF es ~50% más ligero que WebP
- **Blur placeholder** generado con Sharp en build time — evita CLS (Cumulative Layout Shift)
- `fetchpriority="high"` solo en el background del hero y el logo — LCP optimizado
- `loading="lazy"` en todas las imágenes no críticas

### Fuentes
- Solo **WOFF2** — formato moderno, sin fallbacks innecesarios
- `font-display: swap` en las 8 variantes — el texto es visible antes que la fuente custom
- **Preload de Cinzel Regular** en `<head>` — la fuente más usada carga con máxima prioridad

### CSS y JavaScript
- `build.inlineStylesheets: 'always'` — CSS inlineado en HTML, cero requests bloqueantes
- Scroll handler de la navbar con `{ passive: true }` — no bloquea el main thread
- Cero frameworks UI (no React, no Vue) — solo Astro Islands donde hace falta JS

### Headers de caché en Vercel
```json
"/fonts/*"  → Cache-Control: immutable, max-age=31536000  (1 año, nunca re-descarga)
"/images/*" → Cache-Control: max-age=86400, stale-while-revalidate=604800
```

### Headers de seguridad globales
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Bugs corregidos

Analicé el código en profundidad y corregí 6 problemas reales:

### 🔴 La barra de predicciones nunca actualizaba (bug funcional)
**`src/components/CombatVersus.astro`**

El evento `update-prediction-bar` pasaba la respuesta completa de la API (`{ predictions: PredictionResponse, userId }`) pero `PredictionBar` esperaba `{ predictions: array, total_votes }`. Esto causaba un `TypeError: predictions.map is not a function` silencioso — la barra se quedaba con los valores hardcodeados **60%/40%** para siempre independientemente de los votos reales.

```diff
- data: predictionsData
+ data: {
+   predictions: combatPredictions?.predictions ?? [],
+   total_votes: combatPredictions?.total_votes ?? 0,
+ }
```

### 🔴 Datos corruptos en getAllPredictions
**`src/lib/predictions.ts`**

Al crear la entrada de un combate en el acumulador, los dos slots placeholder se inicializaban con los votos del primer luchador. Si un fighter tenía 0 votos en DB, el segundo slot quedaba `{ fighter_id: '', votes: X }` con datos incorrectos.

```diff
- predictions: [
-   { fighter_id: '', votes, percentage: 0 },
-   { fighter_id: '', votes, percentage: 0 },
- ]
+ predictions: []
  // luego push() individual de cada luchador
```

### 🟠 Cookie sin HttpOnly (seguridad)
**`src/lib/auth.ts`**

El cookie `lavelada_user_id` era accesible desde JavaScript del cliente — un XSS podría leer o manipular el ID de votación.

```diff
- `lavelada_user_id=${userId}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
+ `lavelada_user_id=${userId}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`
```

### 🟠 userId sin validar antes de la DB
**`src/pages/api/predictions.ts`**

`isValidUserId()` ya existía en `auth.ts` pero nunca se llamaba en el flujo de votación. Un atacante podía enviar un cookie con valor arbitrario.

```diff
+ if (!isValidUserId(userId)) {
+   userId = getAnonymousUserId(request)
+   isNewUser = true
+ }
```

### 🟡 console.log en producción
**`src/lib/predictions.ts`**

Dos `console.log` dentro del código de caché imprimían en cada request. Con millones de visitas esto satura los logs de Vercel y añade latencia.

### 🟡 Función duplicada eliminada
**`src/lib/boxers.ts`**

`getBoxerVersusById()` era idéntica a `getBoxerById()` — código muerto eliminado.

---

## 🛠️ Stack

- [![Astro][astro-badge]][astro-url] — Framework SSR con Islands Architecture
- [![Typescript][typescript-badge]][typescript-url] — TypeScript estricto en todo el proyecto
- [![Tailwind CSS][tailwind-badge]][tailwind-url] — Tailwind v4 con tema personalizado
- **Turso** — Base de datos cloud SQLite para el sistema de predicciones
- **Vercel** — Deploy SSR con edge functions

---

## Cómo ejecutar

```bash
# 1. Clonar e instalar
git clone https://github.com/tu-usuario/la-velada-web-oficial.git
cd la-velada-web-oficial
pnpm install

# 2. Variables de entorno
cp .env.example .env
# Completar con tus credenciales de Turso y Twitch

# 3. Inicializar base de datos
pnpm db:init

# 4. Desarrollo
pnpm dev
```

**Variables de entorno necesarias:**
```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
TWITCH_CLIENT_ID=...        # opcional
TWITCH_CLIENT_SECRET=...    # opcional
AUTH_SECRET=...             # opcional
```

---

## Roadmap

Lo que implementaría durante las 2 semanas de trabajo:

- [ ] **Tests unitarios** con Vitest para `predictions.ts` y `auth.ts`
- [ ] **Tests e2e** con Playwright — flujo completo de votación
- [ ] **CI/CD** con GitHub Actions: `lint → typecheck → test → build` en cada PR
- [ ] **Rate limiting** en `POST /api/predictions` — crítico para el pico del evento
- [ ] **Loading skeletons** en la porra mientras carga el SSR
- [ ] **Modo live** — resultados en tiempo real durante la noche del evento

---

[astro-url]: https://astro.build/
[typescript-url]: https://www.typescriptlang.org/
[tailwind-url]: https://tailwindcss.com/
[astro-badge]: https://img.shields.io/badge/Astro-fff?style=for-the-badge&logo=astro&logoColor=bd303a&color=352563
[typescript-badge]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white&color=blue
[tailwind-badge]: https://img.shields.io/badge/Tailwind-ffffff?style=for-the-badge&logo=tailwindcss&logoColor=38bdf8
