/**
 * Generates inline SVG data URI placeholders for fighters
 * Used as onerror fallback for missing fighter images
 */

const FIGHTER_COLORS: Record<string, string> = {
  'edu-aguirre': '#e74c3c',
  'gaston-edul': '#3498db',
  'fabiana-sevillano': '#e91e63',
  'la-parce': '#9b59b6',
  'clersss': '#27ae60',
  'natalia-mx': '#f39c12',
  'kidd-keo': '#2980b9',
  'lit-killah': '#8e44ad',
  'alondrissa': '#d35400',
  'angie-velasco': '#16a085',
  'gero-arias': '#c0392b',
  'viruzz': '#f1c40f',
  'roro': '#e91e63',
  'samy-rivers': '#1abc9c',
  'marta-diaz': '#e74c3c',
  'tatiana-kaer': '#9b59b6',
  'yosoyplex': '#2980b9',
  'fernanfloo': '#27ae60',
  'illojuan': '#8e44ad',
  'grefg': '#16a085',
}

export function getFighterPlaceholder(name: string, id: string): string {
  const color = FIGHTER_COLORS[id] || '#c7a86b'
  const safeName = name || id

  // Minimal SVG data URI - fits in URL-safe base64
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='533' viewBox='0 0 400 533'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#1a0a2e'/>
        <stop offset='100%' stop-color='#0a1024'/>
      </linearGradient>
    </defs>
    <rect width='400' height='533' fill='url(#bg)'/>
    <circle cx='200' cy='180' r='80' fill='${color}' opacity='0.2'/>
    <text x='200' y='330' font-family='Georgia,serif' font-size='28' font-weight='bold' fill='#c7a86b' text-anchor='middle'>${safeName}</text>
    <text x='200' y='365' font-family='Georgia,serif' font-size='14' fill='#ffffff' opacity='0.5' text-anchor='middle'>LA VELADA VI</text>
  </svg>`

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/%20/g, ' ')
    .replace(/%0A/g, '')

  return `data:image/svg+xml,${encoded}`
}

export function getArtistPlaceholder(name: string): string {
  const safeName = name || 'Artist'

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'>
    <defs>
      <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#1a0a2e'/>
        <stop offset='100%' stop-color='#0a1024'/>
      </linearGradient>
    </defs>
    <rect width='400' height='400' fill='url(#bg)'/>
    <circle cx='200' cy='150' r='60' fill='#c7a86b' opacity='0.2'/>
    <text x='200' y='260' font-family='Georgia,serif' font-size='28' font-weight='bold' fill='#c7a86b' text-anchor='middle'>${safeName}</text>
    <text x='200' y='295' font-family='Georgia,serif' font-size='14' fill='#ffffff' opacity='0.5' text-anchor='middle'>ARTISTA</text>
  </svg>`

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22')
    .replace(/%20/g, ' ')
    .replace(/%0A/g, '')

  return `data:image/svg+xml,${encoded}`
}
