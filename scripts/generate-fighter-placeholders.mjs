/**
 * Generates placeholder SVG images for all fighters
 * Run with: node scripts/generate-fighter-placeholders.mjs
 */

import { mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FIGHTERS = [
  { id: 'peereira', name: 'Peereira', color: '#e74c3c' },
  { id: 'perxitaa', name: 'Perxitaa', color: '#3498db' },
  { id: 'abby', name: 'Abby', color: '#9b59b6' },
  { id: 'roro', name: 'Roro', color: '#e91e63' },
  { id: 'gaspi', name: 'Gaspi', color: '#f39c12' },
  { id: 'rivaldios', name: 'Rivaldios', color: '#27ae60' },
  { id: 'andoni', name: 'Andoni', color: '#2980b9' },
  { id: 'viruzz', name: 'Viruzz', color: '#8e44ad' },
  { id: 'alana', name: 'Alana', color: '#d35400' },
  { id: 'grefg', name: 'TheGrefg', color: '#16a085' },
  { id: 'westcol', name: 'Westcol', color: '#c0392b' },
  { id: 'arigeli', name: 'Ari Geli', color: '#f1c40f' },
  { id: 'tomas', name: 'Tomás', color: '#1abc9c' },
  { id: 'carlos', name: 'Carlos', color: '#e74c3c' },
]

const OUTPUT_DIR = join(__dirname, '../public/images/fighters/cards')

// Ensure directory exists
mkdirSync(OUTPUT_DIR, { recursive: true })

FIGHTERS.forEach(({ id, name, color }) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">
  <defs>
    <linearGradient id="bg-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a0a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a1024;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
    </linearGradient>
    <filter id="glow-${id}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="533" fill="url(#bg-${id})"/>
  
  <!-- Decorative corner -->
  <path d="M0 0 L80 0 L0 80 Z" fill="${color}" opacity="0.3"/>
  <path d="M400 533 L320 533 L400 453 Z" fill="${color}" opacity="0.3"/>
  
  <!-- Silhouette placeholder -->
  <circle cx="200" cy="180" r="100" fill="url(#accent-${id})" opacity="0.15" filter="url(#glow-${id})"/>
  
  <!-- Name -->
  <text x="200" y="340" 
        font-family="Georgia, serif" 
        font-size="32" 
        font-weight="bold" 
        fill="#c7a86b" 
        text-anchor="middle"
        filter="url(#glow-${id})">
    ${name}
  </text>
  
  <!-- Subtitle -->
  <text x="200" y="380" 
        font-family="Georgia, serif" 
        font-size="16" 
        fill="#ffffff" 
        opacity="0.5"
        text-anchor="middle">
    LA VELADA VI
  </text>
  
  <!-- Bottom accent line -->
  <rect x="100" y="410" width="200" height="2" fill="${color}" opacity="0.5"/>
  
  <!-- Country flag placeholder -->
  <text x="200" y="460" 
        font-family="Arial, sans-serif" 
        font-size="24" 
        fill="#ffffff" 
        opacity="0.7"
        text-anchor="middle">
    🥊
  </text>
</svg>`

  const filepath = join(OUTPUT_DIR, `${id}.svg`)
  writeFileSync(filepath, svg)
  console.log(`Created: ${filepath}`)
})

console.log(`\nGenerated ${FIGHTERS.length} placeholder images in ${OUTPUT_DIR}`)
console.log('Rename .svg to .webp for production use, or update src to use .svg')
