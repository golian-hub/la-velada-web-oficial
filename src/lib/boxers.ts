import { FIGHTERS } from '@/consts/fighters'

export function getBoxerById(boxerId: string) {
  return FIGHTERS.find((b) => b.id === boxerId)
}
