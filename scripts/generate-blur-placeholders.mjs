import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.join(__dirname, '../public')
const BLUR_DATA_FILE = path.join(__dirname, '../src/blur-placeholders.json')
const GALLERY_COUNTS_FILE = path.join(__dirname, '../src/fighter-gallery-counts.json')

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif']

// Load existing data
const existingData = await fs.readFile(BLUR_DATA_FILE, 'utf8')
  .then(json => JSON.parse(json))
  .catch(() => ({}))

async function generateBlurPlaceholder(imagePath) {
  try {
    const imageBuffer = await sharp(imagePath)
      .resize(10) // tiny size
      .webp({ quality: 20 }) // convert to webp with low quality
      .toBuffer()

    // Convert to base64
    return `data:image/webp;base64,${imageBuffer.toString('base64')}`
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error)
    return null
  }
}

async function* walkDirectory(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true })
  for (const file of files) {
    const res = path.resolve(dir, file.name)
    if (file.isDirectory()) {
      yield* walkDirectory(res)
    } else {
      yield res
    }
  }
}

async function generatePlaceholders() {
  const blurData = {}
  const galleryCounts = {}
  let count = 0
  let skipped = 0

  try {
    for await (const filePath of walkDirectory(PUBLIC_DIR)) {
      const ext = path.extname(filePath).toLowerCase()
      if (VALID_EXTENSIONS.includes(ext)) {
        const relativePath = path.relative(PUBLIC_DIR, filePath)
        const normalizedRelativePath = relativePath.replace(/\\/g, '/')
        // console.log(`DEBUG: processing ${normalizedRelativePath}`)
        const stat = await fs.stat(filePath)
        const lastModified = stat.mtimeMs

        // Track gallery counts (must happen before skip logic)
        const galleryRegex = /images\/fighters\/gallery\/([^/]+)\/(\d+)\.webp/
        const galleryMatch = normalizedRelativePath.match(galleryRegex)
        if (galleryMatch) {
          const id = galleryMatch[1]
          const index = parseInt(galleryMatch[2], 10)
          console.log(`DEBUG: MATCH FOUND for ${id}: index ${index}`)
          galleryCounts[id] = Math.max(galleryCounts[id] || 0, index)
        }

        // Skip if already processed and unchanged
        if (existingData[relativePath] && existingData[relativePath].mtime === lastModified) {
          blurData[relativePath] = existingData[relativePath]
          skipped++
          continue
        }

        console.log(`Processing: ${relativePath}`)

        const placeholder = await generateBlurPlaceholder(filePath)
        
        if (placeholder) {
          blurData[relativePath] = {
            placeholder,
            mtime: lastModified,
          }
          count++
        }
      }
    }

    // Save the blur data
    await fs.writeFile(BLUR_DATA_FILE, JSON.stringify(blurData, null, 2))
    // Save the gallery counts
    await fs.writeFile(GALLERY_COUNTS_FILE, JSON.stringify(galleryCounts, null, 2))

    count > 0 && console.log(`🆕 Generated blur placeholders for ${count} images`)
    skipped > 0 && console.log(`✅ Skipped ${skipped} unchanged images`)
    Object.keys(galleryCounts).length > 0 && console.log(`📸 Updated gallery counts for ${Object.keys(galleryCounts).length} fighters`)
    console.log(`📝 Data saved to ${path.relative(process.cwd(), BLUR_DATA_FILE)} and ${path.relative(process.cwd(), GALLERY_COUNTS_FILE)}`)
  } catch (error) {
    console.error('Error generating placeholders:', error)
    process.exit(1)
  }
}

generatePlaceholders()
