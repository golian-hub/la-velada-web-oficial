export interface Combat {
  id: string
  number: number
  fighters: string[] // id de fighters
  title: string
  video: string
  winner: string | null
  description: string
  category: 'male' | 'female'
  type?: 'main-event' | 'co-main-event'
}
