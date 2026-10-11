export type Zone = {
  id: string
  name: string
  area: string
  typicalFare: number
  emoji: string
}

export type Match = {
  name: string
  initials: string
  zone: string
  arrivalOffsetMinutes: number
}
