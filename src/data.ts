import type { Match, Zone } from './types'

export const zones: Zone[] = [
  { id: 'powai', name: 'Powai', area: 'Central Mumbai', typicalFare: 720, emoji: '🌿' },
  { id: 'thane', name: 'Thane', area: 'Eastern suburbs', typicalFare: 980, emoji: '🏙️' },
  { id: 'andheri', name: 'Andheri', area: 'Western suburbs', typicalFare: 610, emoji: '🌇' },
  { id: 'navi-mumbai', name: 'Navi Mumbai', area: 'Harbour corridor', typicalFare: 1120, emoji: '🌊' },
]

export const demoMatches: Match[] = [
  { name: 'Ananya', initials: 'AN', zone: 'Powai', arrivalOffsetMinutes: 5 },
  { name: 'Rohan', initials: 'RO', zone: 'Powai', arrivalOffsetMinutes: 11 },
]
