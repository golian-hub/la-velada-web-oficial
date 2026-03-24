function generateStars(count: number, seed = 0) {
  const stars: string[] = []
  let s = seed + 1
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const x = Math.abs(s % 2000)
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const y = Math.abs(s % 2000)
    stars.push(`${x}px ${y}px #fff`)
  }
  return stars.join(',')
}

function generateColoredStars(count: number, seed: number, color: string) {
  const stars: string[] = []
  let s = seed + 1
  for (let i = 0; i < count; i++) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const x = Math.abs(s % 2000)
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const y = Math.abs(s % 2000)
    stars.push(`${x}px ${y}px ${color}`)
  }
  return stars.join(',')
}

export const starsSmall = generateStars(700, 1)
export const starsMedium = generateStars(200, 2)
export const starsLarge = generateStars(80, 3)
export const starsGold = generateColoredStars(35, 42, '#c7a86b')
export const starsBlue = generateColoredStars(50, 77, '#6a8cc7')
