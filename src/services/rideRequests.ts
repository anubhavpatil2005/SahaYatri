import { supabase } from '../lib/supabase'

export type NewRideRequest = {
  flightNumber: string
  expectedArrival: string
  terminal: string
  dropoffZoneId: string
  luggageSize: 'light' | 'standard'
}

export async function createRideRequest(request: NewRideRequest) {
  if (!supabase) {
    return { mode: 'demo' as const }
  }

  const { data: sessionData } = await supabase.auth.getSession()
  const userId = sessionData.session?.user.id
  if (!userId) {
    throw new Error('Please sign in before joining the live queue.')
  }

  const { error } = await supabase.from('ride_requests').insert({
    user_id: userId,
    flight_number: request.flightNumber,
    expected_arrival: request.expectedArrival,
    terminal: request.terminal,
    dropoff_zone_id: request.dropoffZoneId,
    luggage_size: request.luggageSize,
  })

  if (error) throw error
  return { mode: 'live' as const }
}
