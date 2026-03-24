import type { Social } from '@/types/social'

type fighterId =
  | 'edu-aguirre'
  | 'gaston-edul'
  | 'fabiana-sevillano'
  | 'la-parce'
  | 'clersss'
  | 'natalia-mx'
  | 'kidd-keo'
  | 'lit-killah'
  | 'alondrissa'
  | 'angie-velasco'
  | 'gero-arias'
  | 'viruzz'
  | 'roro'
  | 'samy-rivers'
  | 'marta-diaz'
  | 'tatiana-kaer'
  | 'yosoyplex'
  | 'fernanfloo'
  | 'illojuan'
  | 'grefg'

type fighterName =
  | 'Edu Aguirre'
  | 'Gastón Edul'
  | 'Fabiana Sevillano'
  | 'La Parce'
  | 'Clersss'
  | 'Natalia MX'
  | 'Kidd Keo'
  | 'Lit Killah'
  | 'Alondrissa'
  | 'Angie Velasco'
  | 'Gero Arias'
  | 'Viruzz'
  | 'Roro'
  | 'Samy Rivers'
  | 'Marta Díaz'
  | 'Tatiana Kaer'
  | 'YoSoyPlex'
  | 'Fernanfloo'
  | 'IlloJuan'
  | 'TheGrefg'

interface Clips {
  text: string
  url: string
}

export interface BoxerStats {
  power: number
  speed: number
  stamina: number
  technique: number
  defense: number
}

export interface Fighters {
  id: fighterId
  name: fighterName
  fightName?: string
  city?: string
  realName: string
  gender: 'masculino' | 'femenino' | 'otro'
  targetWeight?: number
  targetGloves?: string
  birthDate: Date
  height: number
  age: number
  weight: number
  country: string
  gallery?: boolean
  versus: fighterId
  socials: Social[]
  clips: Clips[]
  workout?: {
    videoID: string
    thumbnail: string
  }
  bio: string
  stats?: BoxerStats
}
