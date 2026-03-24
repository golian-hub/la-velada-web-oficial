# INFORME DE AUDITORÍA - La Velada Web Oficial

## Fecha: 2026-03-23

## Auditor: SDD Data & Configuration Auditor

---

## RESUMEN EJECUTIVO

| Categoría         | Críticos | Altos | Medios | Bajos |
| ----------------- | -------- | ----- | ------ | ----- |
| Datos/Constantes  | 0        | 3     | 2      | 1     |
| Tipos TypeScript  | 0        | 1     | 2      | 1     |
| Lib/Utils         | 0        | 2     | 2      | 1     |
| Layouts/Estilos   | 0        | 0     | 1      | 1     |
| Configuración     | 0        | 1     | 1      | 0     |
| Referencias Rotas | 1        | 2     | 0      | 0     |
| **TOTAL**         | **1**    | **9** | **8**  | **4** |

---

## 1. REFERENCIAS ROTAS A DATOS LEGACY (CRÍTICO + ALTOS)

### 1.1 [CRÍTICO] BoxerCardCss.astro - Referencia a 'westcol' inexistente

- **Archivo**: `src/components/BoxerCardCss.astro` (líneas 77-88)
- **Problema**: El mapa `boxerCardVariants` contiene entrada para `westcol` y `grefg` referencia `westcol` como oponente. `westcol` NO existe en `FIGHTERS`.
- **Impacto**: TypeScript error porque `Fighters['id']` no incluye `'westcol'`. Potencial runtime error si se usa este componente.
- **Corrección**: Actualizar `grefg` para usar `'illojuan'` como oponente, y eliminar la entrada `westcol` completamente.

### 1.2 [ALTO] BoxerCardCss.astro - 12 IDs de luchadores legacy

- **Archivo**: `src/components/BoxerCardCss.astro` (completo)
- **Problema**: El objeto `boxerCardVariants` referencia luchadores de ediciones anteriores que NO existen en el FIGHTERS actual:
  - `peereira`, `rivaldios`, `perxitaa`, `gaspi`, `abby`, `andoni`, `carlos`, `tomas`, `alana`, `arigeli`, `westcol`
- **Corrección**: Reescribir `boxerCardVariants` para usar únicamente los 20 IDs actuales del `fighterId` type.

### 1.3 [ALTO] SelectYourBoxer.astro - Referencia a 'westcol'

- **Archivo**: `src/components/Boxers/SelectYourBoxer.astro` (líneas 42-44)
- **Problema**: Busca explícitamente `boxerId === 'westcol'` para ordenar los boxeadores móviles. `westcol` no existe.
- **Corrección**: Cambiar a un ID de luchador existente para el Main Event (ej: `'illojuan'` o `'grefg'`).

### 1.4 [ALTO] image-fallback.ts - 12 colores de luchadores obsoletos

- **Archivo**: `src/lib/image-fallback.ts` (líneas 6-22)
- **Problema**: `FIGHTER_COLORS` tiene 12 entradas de luchadores antiguos:
  ```
  peereira, perxitaa, abby, gaspi, rivaldios, andoni, alana, westcol, arigeli, tomas, carlos, rivaldo
  ```
  Solo `roro`, `viruzz`, y `grefg` coinciden con luchadores actuales.
- **Corrección**: Actualizar `FIGHTER_COLORS` con los 20 IDs actuales del evento La Velada VI.

### 1.5 [MEDIO] PorraHome.astro - Hardcoded luchadores obsoletos

- **Archivo**: `src/sections/PorraHome.astro` (líneas 66-69)
- **Problema**: Condiciones hardcodeadas para `perxitaa`, `gaspi`, `tomas` (no existen), y `viruzz` (existe pero con oponente diferente ahora).
- **Corrección**: Eliminar o actualizar las condiciones de posicionamiento CSS a los luchadores actuales.

---

## 2. PROBLEMAS EN TIPOS TYPESCRIPT

### 2.1 [ALTO] Combat.fighters es `string[]` en lugar de `fighterId[]`

- **Archivo**: `src/types/Combat.ts` (línea 4)
- **Problema**: `fighters: string[]` no proporciona type-safety. No garantiza que los IDs sean válidos `fighterId`.
- **Corrección**: Cambiar a `fighters: fighterId[]` importando el type de `fighters.ts`, o crear un `CombatFighterId` union type.

### 2.2 [MEDIO] countries.ts usa `image: any`

- **Archivo**: `src/consts/countries.ts` (línea 11)
- **Problema**: `image: any` pierde type-safety. Debería usar `ImageMetadata` de Astro.
- **Corrección**: `import type { ImageMetadata } from 'astro'` y cambiar a `image: ImageMetadata`.

### 2.3 [MEDIO] sponsors.ts y social.ts usan `logo: any`

- **Archivos**: `src/types/sponsors.ts` (línea 35), `src/types/social.ts` (línea 13), `src/types/bannerType.ts` (línea 10)
- **Problema**: `logo: any` en lugar de tipar correctamente como `ImageMetadata`.
- **Corrección**: Importar `ImageMetadata` de Astro y usar tipos específicos.

### 2.4 [MEDIO] Fighters.country es `string` no `Country['id']`

- **Archivo**: `src/types/fighters.ts` (línea 73)
- **Problema**: `country: string` acepta cualquier valor, no solo los IDs válidos de `countries.ts` ('ar', 'mx', 'co', 'es', 'pr', 'sv').
- **Corrección**: Cambiar a un union type de los países válidos o importar `Country['id']`.

---

## 3. PROBLEMAS EN LIB/UTILS

### 3.1 [ALTO] getBoxerVersusById es idéntica a getBoxerById

- **Archivo**: `src/lib/boxers.ts` (líneas 3-9)
- **Problema**: `getBoxerVersusById` y `getBoxerById` tienen implementación idéntica. `getBoxerVersusById` es código muerto redundante.
- **Corrección**: Eliminar `getBoxerVersusById` y reemplazar sus 2 usos (SelectYourBoxer.astro) con `getBoxerById`.

### 3.2 [ALTO] get-image-count.ts usa `fs` de Node.js (SSR incompatibilidad)

- **Archivo**: `src/utils/get-image-count.ts` (líneas 1-2)
- **Problema**: Usa `import fs from 'fs'` y `import path from 'path'`. Con `output: 'server'` en Vercel Edge Functions, `fs` no está disponible.
- **Corrección**: Usar `import.meta.glob` para contar imágenes, o mover esta lógica a un script de build.

### 3.3 [MEDIO] boxers.ts - parámetro `boxerId` tipado como `string`

- **Archivo**: `src/lib/boxers.ts` (líneas 3, 7)
- **Problema**: `boxerId: string` en lugar de usar el type `fighterId` para mayor seguridad.
- **Corrección**: Tipar como `boxerId: Fighters['id']` o importar `fighterId`.

### 3.4 [MEDIO] get-predictions-for-page.ts - inconsistencia de caché

- **Archivo**: `src/lib/get-predictions-for-page.ts` (línea 26)
- **Problema**: Usa `CACHE_DURATION = 15 * 1000` (15 segundos), mientras que `predictions.ts` usa 30 segundos. Las dos estrategias de caché no están sincronizadas.
- **Corrección**: Definir la duración de caché en una constante compartida o sincronizar los valores.

### 3.5 [BAJO] predictions.ts - Error genérico sin contexto

- **Archivo**: `src/lib/predictions.ts` (varias líneas)
- **Problema**: Todos los errores son `throw new Error('Error al obtener...')` sin incluir el error original. Pierde stack trace.
- **Corrección**: `throw new Error('...', { cause: error })` o incluir el error original en el log.

---

## 4. PROBLEMAS DE ASSETS E IMÁGENES

### 4.1 [ALTO] illojuan card es PNG, código espera WebP

- **Archivos**:
  - Asset: `public/images/fighters/cards/illojuan.png` (existe como .png)
  - Código: `BoxerCard.astro` (línea 26) usa `src={/images/fighters/cards/${id}.webp}`
- **Problema**: Todas las tarjetas de luchadores son `.webp` excepto `illojuan` que es `.png`. El componente renderizará una URL rota para la tarjeta de illojuan.
- **Corrección**: Renombrar `illojuan.png` a `illojuan.webp` o generar la versión WebP.

### 4.2 [MEDIO] Artists.astro vs ArtistsSection.astro - inconsistencia de imágenes

- **Archivos**: `src/sections/Artists.astro` vs `src/sections/ArtistsSection.astro`
- **Problema**:
  - `Artists.astro` usa las imágenes locales de `artist.image` (`/images/artists/*.webp`) ✓
  - `ArtistsSection.astro` usa URLs externas de Unsplash (solo `aitana` tiene imagen real, el resto son stock photos genéricas) ✗
- **Corrección**: Unificar ambas secciones para usar las imágenes locales. Eliminar URLs de Unsplash.

### 4.3 [BAJO] No hay imágenes de tarjeta para todos los luchadores en formato correcto

- **Verificación**: Se confirmaron las imágenes `.webp` en `public/images/fighters/cards/` para los 20 luchadores, excepto `illojuan` (`.png`).
- Las imágenes `big` y `combat` están presentes para todos los luchadores.

---

## 5. PROBLEMAS DE CONFIGURACIÓN

### 5.1 [ALTO] package.json - Nombre dice "velada-v" pero es velada VI

- **Archivo**: `package.json` (línea 2)
- **Problema**: `"name": "la-velada-del-ano-v-web-oficial"` pero el proyecto es La Velada VI.
- **Corrección**: Cambiar a `"la-velada-del-ano-vi-web-oficial"`.

### 5.2 [MEDIO] vercel.json - Redirecciones a 2024/2025 sin verificación

- **Archivo**: `vercel.json` (líneas 12-25)
- **Problema**: Rewrites a `https://2024.infolavelada.com` y `https://2025.infolavelada.com`. Estos dominios deben existir y estar activos.
- **Corrección**: Verificar que ambos subdominios están desplegados y accesibles.

### 5.3 [MEDIO] astro.config.mjs - output: 'server' sin configuración de edge

- **Archivo**: `astro.config.mjs` (línea 10)
- **Problema**: `output: 'server'` con adapter Vercel por defecto usa Serverless. El componente `get-image-count.ts` usa `fs` que falla en Edge. No hay configuración explícita del runtime.
- **Corrección**: Asegurar que el adapter Vercel está configurado correctamente o migrar `get-image-count.ts`.

---

## 6. PROBLEMAS DE ESTILOS Y LAYOUTS

### 6.1 [MEDIO] BackgroundLayout.astro - Slot fuera del section

- **Archivo**: `src/layouts/BackgroundLayout.astro` (líneas 1-7)
- **Problema**: El `<slot />` está dentro del `div` que tiene la máscara de fade. El contenido heredará el `mask-image` que puede cortar contenido largo.
- **Corrección**: Considerar si el slot debe estar fuera del div con la máscara.

### 6.2 [BAJO] global.css - Redefine min-h-screen y h-screen

- **Archivo**: `src/styles/global.css` (líneas 167-183)
- **Problema**: Sobrescribe las utilidades `min-h-screen` y `h-screen` de Tailwind con `100svh` en móvil y `100vh` en desktop. Esto puede causar comportamiento inesperado si se usa en contexto donde se espera el comportamiento estándar de Tailwind.
- **Corrección**: Documentar esta decisión o usar nombres de clase personalizados.

---

## 7. INCONSISTENCIAS DE DATOS ENTRE ARCHIVOS

### 7.1 [MEDIO] fighters.ts socials siempre vacío, type permite Social[]

- **Archivo**: `src/consts/fighters.ts` (todos los luchadores)
- **Problema**: Todos los luchadores tienen `socials: []` pero el type `Fighters` dice `socials: Social[]`. No hay datos de redes sociales para ningún luchador.
- **Corrección**: O bien llenar los datos de redes sociales, o hacer `socials` opcional con `socials?: Social[]`.

### 7.2 [MEDIO] countries.ts - Imports relativos desde public/

- **Archivo**: `src/consts/countries.ts` (líneas 1-6)
- **Problema**: Usa `import ar from '../../public/images/flags/ar.webp'`. En Astro, importar desde `public/` es antipattern - los assets estáticos en `public/` no pasan por el pipeline de build.
- **Corrección**: Mover las imágenes de flags a `src/assets/flags/` o usar rutas absolutas como string.

### 7.3 [BAJO] pageTitles.ts - Exportaciones nombradas inconsistentes

- **Archivo**: `src/consts/pageTitles.ts`
- **Problema**: Usa `export const fixedTitle`, `export const porra`, etc. sin agruparlas. Otros archivos de consts usan arrays exportados agrupados (ej: `export const FIGHTERS`, `export const COMBATS`).
- **Corrección**: Menor - mantener consistencia de naming si es necesario.

---

## 8. PROBLEMAS DE TYPESCRIPT GENERALES

### 8.1 [MEDIO] SelectYourBoxer.astro - boxer puede ser undefined

- **Archivo**: `src/components/Boxers/SelectYourBoxer.astro` (líneas 118-125)
- **Problema**: `getBoxerById(boxerId)` puede retornar `undefined`, pero se accede a `boxer.versus` sin null check. TypeScript strict mode debería marcar esto.
- **Corrección**: Añadir guard: `if (!boxer) return null` antes de usar el boxer.

### 8.2 [MEDIO] PorraHome.astro - getBoxerById sin null check

- **Archivo**: `src/sections/PorraHome.astro` (línea 81)
- **Problema**: `getBoxerById(fighter)?.name.split(' ')` - si el fighter no existe, se accede a `undefined` encadenado.
- **Corrección**: Verificar que el fighter existe antes de acceder a sus propiedades.

---

## 9. RECOMENDACIONES DE CORRECCIÓN PRIORITARIAS

### Prioridad 1 (Inmediata - Bloquea funcionalidad):

1. **Renombrar** `illojuan.png` → `illojuan.webp` en `public/images/fighters/cards/`
2. **Actualizar** `BoxerCardCss.astro` con los 20 IDs actuales de La Velada VI
3. **Corregir** `SelectYourBoxer.astro` línea 42: cambiar `'westcol'` a `'illojuan'` o `'grefg'`
4. **Limpiar** `FIGHTER_COLORS` en `image-fallback.ts` con luchadores actuales

### Prioridad 2 (Corta - Mejora type-safety):

5. **Tipar** `Combat.fighters` como `fighterId[]` en lugar de `string[]`
6. **Eliminar** `getBoxerVersusById` (función duplicada) y usar `getBoxerById`
7. **Actualizar** `package.json` name a `la-velada-del-ano-vi-web-oficial`
8. **Unificar** Artists sections para usar imágenes locales

### Prioridad 3 (Media - Calidad de código):

9. **Tipar** `image: any` en types con `ImageMetadata`
10. **Corregir** `countries.ts` para importar desde `src/assets/` no `public/`
11. **Resolver** incompatibilidad de `fs` en `get-image-count.ts`
12. **Sincronizar** duración de caché entre `predictions.ts` y `get-predictions-for-page.ts`

---

## ESTADO DE ARCHIVOS VERIFICADOS

### ✅ Sin problemas significativos:

- `src/consts/fighters.ts` - 20 luchadores definidos correctamente
- `src/consts/combats.ts` - 10 combates con IDs válidos que referencian fighters existentes
- `src/consts/artists.ts` - 7 artistas con imágenes locales existentes
- `src/consts/sponsors.ts` - 12 sponsors con SVGs existentes
- `src/consts/social.ts` - 3 redes sociales con SVGs existentes
- `src/consts/bannerData.ts` - 2 banners con imágenes existentes
- `src/types/Combat.ts` - Interface correcta
- `src/types/artists.ts` - Type definido correctamente
- `src/lib/countdown.ts` - Implementación limpia
- `src/lib/database.ts` - Configuración Turso correcta
- `src/lib/auth.ts` - Sistema de cookies anónimo funcional
- `src/lib/predictions.ts` - Sistema de caché y votos robusto
- `src/utils/remove-mirrored-pairs.ts` - Utilidad genérica correcta
- `src/utils/get-optimized-image-url.ts` - Manejo de imágenes externas y locales
- `src/utils/get-blurred-image-url.ts` - Sistema de placeholders correcto
- `src/layouts/Layout.astro` - SEO completo, schema.org, accesibilidad
- `src/styles/global.css` - Tailwind v4, fonts, theme variables correctos
- `astro.config.mjs` - Configuración Astro 5 correcta
- `tsconfig.json` - Extiende strict, paths correctos
- `auth.config.ts` - Twitch provider configurado
- `vercel.json` - Redirects y rewrites correctos

### ✅ Assets verificados presentes:

- Flags: ar, mx, co, es, pr, sv (6/6) ✓
- Artists: aitana, delarose, eladiocarrion, grupofrontera, losdelrio, melendi, myketowers (7/7) ✓
- Sponsors SVGs: 12/12 ✓
- Social SVGs: x, instagram, github (3/3) ✓
- Banners: revolut.webp, alsa.webp (2/2) ✓
- Fonts: 8/8 woff2 files ✓
- Favicon, logo.svg, apple-touch-icon.png, site.webmanifest, og.jpg ✓
- Background.avif ✓
- Fighter big images: 20/20 ✓
- Fighter combat images: 20/20 + 10 combats ✓
- Fighter card images: 19/20 (illojuan es .png) ⚠️

---

_Informe generado automáticamente. Guardado en: AUDIT_REPORT.md_
