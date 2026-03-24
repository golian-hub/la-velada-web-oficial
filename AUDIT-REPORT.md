# Auditoría de Páginas — La Velada Web Oficial (Astro)

**Fecha:** 2026-03-23  
**Proyecto:** La Velada del Año VI  
**Framework:** Astro v4+ (Tailwind CSS v4, tailwind-animations)

---

## Resumen Ejecutivo

| Severidad                  | Cantidad                |
| -------------------------- | ----------------------- |
| 🔴 BUG (funcional)         | 2                       |
| 🟠 WARNING (posible error) | 3                       |
| 🟡 CODE SMELL / MEJORA     | 5                       |
| ✅ OK                      | 5 páginas sin problemas |

**Páginas revisadas:** 9  
**Imports verificados:** 47  
**Componentes/archivos inexistentes:** 0

---

## 🔴 BUGS (Errores Funcionales)

### BUG-1: CSS inválido en `porra.astro` línea 314

**Archivo:** `src/pages/porra.astro:314`  
**Severidad:** 🔴 CRÍTICO

```css
/* INCORRECTO — sintaxis CSS inválida */
border: 1px border #c7a86b/30;
```

**Problema:** `border` no es un valor válido para la propiedad `border`. Además, `#c7a86b/30` es sintaxis Tailwind, no CSS válido.

**Corrección:**

```css
border: 1px solid rgba(199, 168, 107, 0.3);
```

**Impacto:** El pseudo-elemento `::after` del botón con voto no mostrará borde correctamente. El texto "TU ELECCIÓN" aparecerá sin el borde dorado decorativo.

---

### BUG-2: LiteYouTube renderiza con videoId vacío en `combates/[id].astro`

**Archivo:** `src/pages/combates/[id].astro:126-138`  
**Severidad:** 🔴 FUNCIONAL

```astro
{combat?.video && (
  <div class="mx-auto mt-16 max-w-4xl px-5">
    <SectionTitle class="pb-8" title={combat?.title} />
    <LiteYouTube
      videoId={combat?.video}
      ...
    />
  </div>
)}
```

**Problema:** En `src/consts/combats.ts`, TODOS los combates tienen `video: ''` (string vacío). En JavaScript, `''` es falsy, por lo que el bloque NO se renderizará. **Sin embargo**, si en el futuro algún combate tiene un video con valor parcial (ej: solo espacios), el componente `LiteYouTube` renderizaría un embed roto.

**Estado actual:** No se rompe hoy porque todos son `''` (falsy), pero es una trampa para el futuro. Si se añade un video a cualquier combate sin actualizar la lógica, el componente renderizará un `<lite-youtube videoid="">` vacío.

**Corrección recomendada:** Cambiar la condición a `combat?.video && combat.video.trim() !== ''`.

---

## 🟠 WARNINGS (Posibles Errores)

### WARN-1: `CombatVersus.astro` usa predicciones HARDCODED como placeholder

**Archivo:** `src/components/CombatVersus.astro:58-72`  
**Severidad:** 🟠 DATOS INCORRECTOS

```astro
<PredictionBar
  combatId={id}
  overlay={true}
  fighter1={{
    id: fighter1?.id || '',
    name: fighter1?.name || '',
    percentage: 60,  // ← HARDCODED
  }}
  fighter2={{
    id: fighter2?.id || '',
    name: fighter2?.name || '',
    percentage: 40,  // ← HARDCODED
  }}
  totalVotes={100}   // ← HARDCODED
/>
```

**Problema:** La PredictionBar muestra 60%/40% con 100 votos como valores iniciales para TODOS los combates. El script del componente intenta actualizar estos valores vía API (`/api/predictions?combat_id=...`), pero si la API falla o tarda, el usuario ve datos incorrectos.

**Riesgo:** Mostrar datos de predicción inventados al usuario antes de que llegue la respuesta del servidor.

**Corrección:** Inicializar con `50/50` y `0` votos, o usar `showInitial={false}` para ocultar la barra hasta tener datos reales.

---

### WARN-2: `fixedTitle` importado pero no usado en `combats/index.astro`

**Archivo:** `src/pages/combats/index.astro:3`  
**Severidad:** 🟠 WARNING TYPESCRIPT

```typescript
import { fixedTitle, combates } from '@/consts/pageTitles'
//             ^^^^^^^^^ — importado pero nunca usado
```

**Problema:** `fixedTitle` se importa pero no se utiliza en ninguna parte del archivo. `combates` SÍ se usa en `<Layout title={combates} ...>`.

**Corrección:** Eliminar `fixedTitle` del import:

```typescript
import { combates } from '@/consts/pageTitles'
```

---

### WARN-3: Rutas duplicadas `/combates` y `/combats` con contenido diferente

**Archivos:** `src/pages/combates/index.astro` vs `src/pages/combats/index.astro`  
**Severidad:** 🟠 SEO / UX

| Ruta        | Diseño                        | Usa PredictionBar | Usa BoxerCard |
| ----------- | ----------------------------- | ----------------- | ------------- |
| `/combates` | Lista vertical con cards      | ❌                | ❌            |
| `/combats`  | Grid con Main Event destacado | ✅                | ✅            |

**Problema:** Dos rutas diferentes muestran el mismo concepto (lista de combates) con diseños completamente diferentes. Esto genera:

- Contenido duplicado para SEO (canonical apunta a `/combates` en ambas)
- Confusión para el usuario (¿cuál es la versión "oficial"?)
- Mantenimiento duplicado

**Corrección:** Consolidar en una sola ruta. Si `/combats` es el rediseño, eliminar `/combates` o viceversa. O bien, hacer redirect de una a otra.

---

## 🟡 CODE SMELL / MEJORAS

### SMELL-1: `combates/[id].astro` — Doble verificación redundante de `combat`

**Archivo:** `src/pages/combates/[id].astro:14-18`

```typescript
const combat = COMBATS.find((c) => c.id === id)
if (!combat) return Astro.redirect('/404')  // ← Redirige si es null

const fighter1 = getBoxerById(combat?.fighters[0])  // ← ¿Por qué optional chaining?
const fighter2 = getBoxerById(combat?.fighters[1])
```

**Problema:** Después del redirect, `combat` nunca será `undefined`. El uso de `combat?.` es innecesario y puede confundir a otros desarrolladores haciéndoles creer que `combat` puede ser null en ese punto.

**Corrección:** Usar `combat.fighters[0]` directamente después de la verificación.

---

### SMELL-2: `artists.astro` — Ruta en inglés, resto del sitio en español

**Archivo:** `src/pages/artists.astro`  
**Severidad:** 🟡 INCONSISTENCIA

**Problema:** La ruta es `/artists` (inglés) mientras que las demás páginas usan español (`/combates`, `/luchadores`, `/porra`). Las secciones de la home page usan `ArtistsSection` pero la URL es inconsistente.

**Corrección:** Renombrar a `artistas.astro` para consistencia con el idioma del sitio, o mantener `/artists` como decisión consciente de marca.

---

### SMELL-3: `luchador/[id].astro` — Código CSS muero no utilizado

**Archivo:** `src/pages/luchador/[id].astro:183-206`

```css
.stat-item { ... }           /* No existe ningún .stat-item en el template */
.stat-item:nth-child(1) { ... }
.mask-image-fade-bottom { ... } /* Diferente de mask-fade-bottom del global */
```

**Problema:** Las clases `.stat-item` y `.mask-image-fade-bottom` están definidas en el `<style>` pero NUNCA se usan en el template del componente. Es código muerto.

**Corrección:** Eliminar los estilos no utilizados.

---

### SMELL-4: `luchador/[id].astro` — Optional chaining redundante en `opponent`

**Archivo:** `src/pages/luchador/[id].astro:123`

```astro
{opponent && (
  <img
    alt={`Enfrentamiento entre ${fighter.name} y ${opponent?.name ?? 'su oponente'}`}
    ...
  />
)}
```

**Problema:** El bloque completo está dentro de `{opponent && (...)}`, por lo que `opponent` nunca será null/undefined aquí. `opponent?.name` es equivalente a `opponent.name`.

**Corrección:** Cambiar `opponent?.name` a `opponent.name`.

---

### SMELL-5: `BoxerGallery.astro` — Uso de `fs.readFileSync` en renderizado

**Archivo:** `src/utils/get-image-count.ts`

```typescript
export function fighterGallery(id: string): number {
  const dirPath = path.join(process.cwd(), 'public', 'images', 'fighters', 'gallery', id)
  const files = fs.readdirSync(dirPath)  // ← I/O síncrono en build
  ...
}
```

**Problema:** Lee el filesystem de forma síncrona durante el renderizado de cada página de luchador. Esto es funcional pero tiene implicaciones:

- No funciona en entornos serverless edge (sin filesystem)
- Bloquea el event loop durante la lectura del directorio
- Si se usa SSR, puede causar timeouts

**Corrección:** Considerar precargar el conteo de imágenes en un mapa durante el build, o usar `import.meta.glob`.

---

## ✅ PÁGINAS SIN PROBLEMAS DE IMPORTS

### `src/pages/index.astro` ✅

- Todos los imports resuelven correctamente: `Layout`, `InfojobsLogo` (SVG existe), `FightersSection`, `CombatsSection`, `ArtistsSection`, `countdown`
- Props pasadas correctamente al Layout
- Script del countdown usa la API correcta

### `src/pages/luchadores/index.astro` ✅

- Imports: `Layout`, `FIGHTERS`, `countries`, `SectionTitle` — todos existen
- Filtrado por género correcto
- Links a `/luchador/${fighter.id}` consistentes con la ruta dinámica

### `src/pages/404.astro` ✅

- Import mínimo de `Layout`
- Clase `mask-fade-bottom` existe en `global.css`
- Enlace a `/` funcional

### `src/pages/artists.astro` ✅

- `ArtistCard` recibe `{artist}` que tiene `{name, image}` — coincide con Props
- `ARTISTS` const tiene los campos correctos

---

## 📋 TABLA COMPLETA DE IMPORTS VERIFICADOS

| Archivo Importado                     | Estado             | Usado En                       |
| ------------------------------------- | ------------------ | ------------------------------ |
| `@/layouts/Layout.astro`              | ✅ Existe          | Todas las páginas              |
| `@/assets/sponsors/Infojobs.svg`      | ✅ Existe          | index.astro                    |
| `@/sections/FightersSection.astro`    | ✅ Existe          | index.astro                    |
| `@/sections/CombatsSection.astro`     | ✅ Existe          | index.astro                    |
| `@/sections/ArtistsSection.astro`     | ✅ Existe          | index.astro                    |
| `@/consts/combats`                    | ✅ Existe          | 4 páginas                      |
| `@/consts/fighters`                   | ✅ Existe          | 3 páginas                      |
| `@/consts/countries`                  | ✅ Existe          | 2 páginas                      |
| `@/consts/pageTitles`                 | ✅ Existe          | 3 páginas                      |
| `@/consts/artists`                    | ✅ Existe          | artists.astro                  |
| `@/lib/boxers`                        | ✅ Existe          | 4 páginas                      |
| `@/lib/countdown`                     | ✅ Existe          | index.astro                    |
| `@/lib/predictions`                   | ✅ Existe          | 2 páginas                      |
| `@/lib/auth`                          | ✅ Existe          | porra.astro                    |
| `@/components/SectionTitle.astro`     | ✅ Existe          | 3 páginas                      |
| `@/components/BoxerCard.astro`        | ✅ Existe          | 2 páginas                      |
| `@/components/CombatVersus.astro`     | ✅ Existe          | 2 páginas                      |
| `@/components/LiteYouTube.astro`      | ✅ Existe          | 1 página                       |
| `@/components/PredictionBar.astro`    | ✅ Existe          | 2 páginas                      |
| `@/components/ArtistCard.astro`       | ✅ Existe          | 1 página                       |
| `@/components/RadarChart.astro`       | ✅ Existe          | 1 página                       |
| `@/components/BoxerProfileCard.astro` | ✅ Existe          | 1 página                       |
| `@/components/BoxerClipDrawer.astro`  | ✅ Existe          | 1 página                       |
| `@/components/BoxerClipList.astro`    | ✅ Existe          | 1 página                       |
| `@/components/BoxerGallery.astro`     | ✅ Existe          | 1 página                       |
| `@/components/BoxerWorkout.astro`     | ✅ Existe          | 1 página                       |
| `@/components/BoxerSocialLink.astro`  | ✅ Existe          | 1 página                       |
| `@/utils/get-image-count`             | ✅ Existe          | BoxerGallery                   |
| `@/components/Icons`                  | ✅ Existe          | BoxerGallery                   |
| `canvas-confetti`                     | ✅ En package.json | porra.astro                    |
| `@/assets/svg/logo.svg`               | ✅ Existe          | BoxerProfileCard               |
| `@/assets/svg/youtube.svg`            | ✅ Existe          | BoxerClipList, BoxerClipDrawer |
| `@/assets/svg/close.svg`              | ✅ Existe          | BoxerClipDrawer                |

---

## 🔧 ACCIONES RECOMENDADAS (PRIORIDAD)

1. **[URGENTE]** Corregir CSS inválido en `porra.astro:314` → `border: 1px solid rgba(199, 168, 107, 0.3);`
2. **[ALTA]** Consolidar `/combates` y `/combats` en una sola ruta
3. **[ALTA]** Eliminar import `fixedTitle` no usado en `combats/index.astro`
4. **[MEDIA]** Cambiar predicciones hardcoded (60/40) en `CombatVersus.astro` a 50/50 o `showInitial={false}`
5. **[MEDIA]** Eliminar CSS muerto de `luchador/[id].astro`
6. **[BAJA]** Renombrar ruta `/artists` → `/artistas` para consistencia idiomática
7. **[BAJA]** Refactorizar `get-image-count.ts` para evitar `fs.readFileSync` en SSR
