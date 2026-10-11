import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { demoMatches, zones } from './data'
import brandLogo from '../gemini-svg.svg'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { createRideRequest } from './services/rideRequests'

type Step = 'details' | 'queue' | 'matched'

const formatRupees = (amount: number) => `₹${amount.toLocaleString('en-IN')}`

export default function App() {
  const [step, setStep] = useState<Step>('details')
  const [flightNumber, setFlightNumber] = useState('AI 681')
  const [arrivalTime, setArrivalTime] = useState('20:15')
  const [terminal, setTerminal] = useState('T2')
  const [zoneId, setZoneId] = useState('powai')
  const [luggage, setLuggage] = useState<'light' | 'standard'>('standard')
  const [email, setEmail] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [authMessage, setAuthMessage] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [queueMode, setQueueMode] = useState<'demo' | 'live'>('demo')
  const selectedZone = useMemo(() => zones.find((zone) => zone.id === zoneId)!, [zoneId])
  const estimatedSplit = Math.ceil(selectedZone.typicalFare / 3)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => authListener.subscription.unsubscribe()
  }, [])

  const sendMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !email) return
    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setAuthMessage(error ? error.message : 'Check your inbox for a secure sign-in link.')
  }

  const joinQueue = async () => {
    if (isSupabaseConfigured && !session) {
      setFormError('Sign in with your email first to join the live queue.')
      return
    }
    setFormError('')
    setIsSubmitting(true)
    try {
      const result = await createRideRequest({
        flightNumber,
        expectedArrival: arrivalTime,
        terminal,
        dropoffZoneId: zoneId,
        luggageSize: luggage,
      })
      setQueueMode(result.mode)
      setStep('queue')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'We could not join the queue. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
  const showDemoMatch = () => setStep('matched')
  const resetTrip = () => setStep('details')

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SahaYatri home">
          <img src={brandLogo} alt="SahaYatri — smart airport pooling" />
        </a>
        <span className="pilot-badge">Mumbai pilot</span>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">Airport rides, shared better</p>
        <h1>Land together.<br /><em>Ride smarter.</em></h1>
        <p className="hero-copy">Find people arriving when you do and travelling toward the same part of Mumbai.</p>
      </section>

      {isSupabaseConfigured && !session ? (
        <section className="auth-card" aria-labelledby="sign-in-title">
          <div>
            <p className="eyebrow">Live queue access</p>
            <h2 id="sign-in-title">Sign in before matching</h2>
            <p>We use a secure email link instead of passwords or paid SMS OTPs.</p>
          </div>
          <form onSubmit={sendMagicLink}>
            <label htmlFor="email">Email address</label>
            <div className="email-row">
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
              <button className="secondary-button" type="submit">Send link</button>
            </div>
          </form>
          {authMessage ? <p className="auth-message" role="status">{authMessage}</p> : null}
        </section>
      ) : null}

      {isSupabaseConfigured && session ? <p className="signed-in">Signed in as {session.user.email}</p> : null}

      <section className="progress" aria-label="Ride request progress">
        {['Trip details', 'Find co-riders', 'Your group'].map((label, index) => {
          const complete = (step === 'queue' && index === 0) || (step === 'matched' && index < 2)
          const active = (step === 'details' && index === 0) || (step === 'queue' && index === 1) || (step === 'matched' && index === 2)
          return <div className="progress-item" key={label}>
            <span className={`progress-dot ${complete ? 'complete' : ''} ${active ? 'active' : ''}`}>{complete ? '✓' : index + 1}</span>
            <span>{label}</span>
          </div>
        })}
      </section>

      {step === 'details' ? (
        <section className="card request-card" aria-labelledby="trip-title">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Step 1 of 3</p>
              <h2 id="trip-title">Tell us about your arrival</h2>
            </div>
            <span className="airport-code">BOM</span>
          </div>
          <label>Flight number
            <input value={flightNumber} onChange={(event) => setFlightNumber(event.target.value.toUpperCase())} placeholder="e.g. AI 681" />
          </label>
          <div className="two-column">
            <label>Expected landing
              <input type="time" value={arrivalTime} onChange={(event) => setArrivalTime(event.target.value)} />
            </label>
            <label>Terminal
              <select value={terminal} onChange={(event) => setTerminal(event.target.value)}><option>T2</option><option>T1</option></select>
            </label>
          </div>
          <fieldset>
            <legend>Where are you heading?</legend>
            <div className="zone-grid">
              {zones.map((zone) => <button className={`zone-option ${zone.id === zoneId ? 'selected' : ''}`} type="button" onClick={() => setZoneId(zone.id)} key={zone.id}>
                <span aria-hidden="true">{zone.emoji}</span><strong>{zone.name}</strong><small>{zone.area}</small>
              </button>)}
            </div>
          </fieldset>
          <fieldset>
            <legend>Luggage</legend>
            <div className="choice-row">
              <button type="button" className={luggage === 'light' ? 'choice selected' : 'choice'} onClick={() => setLuggage('light')}>Light<br /><small>Cabin bag only</small></button>
              <button type="button" className={luggage === 'standard' ? 'choice selected' : 'choice'} onClick={() => setLuggage('standard')}>Standard<br /><small>1 check-in bag</small></button>
            </div>
          </fieldset>
          <aside className="estimate"><span>Estimated shared fare</span><strong>{formatRupees(estimatedSplit)}–{formatRupees(estimatedSplit + 80)}</strong><small>Based on a 3-person ride to {selectedZone.name}</small></aside>
          {formError ? <p className="form-error" role="alert">{formError}</p> : null}
          <button className="primary-button" type="button" onClick={joinQueue} disabled={!flightNumber || !arrivalTime || isSubmitting}>{isSubmitting ? 'Joining the queue…' : 'Find my co-riders'} <span aria-hidden="true">→</span></button>
          <p className="fine-print">No payment or contact sharing happens until you approve a group.</p>
        </section>
      ) : null}

      {step === 'queue' ? (
        <section className="card queue-card" aria-live="polite">
          <div className="radar" aria-hidden="true"><span /><span /><i /></div>
          <p className="eyebrow">Looking around Terminal 2</p>
          <h2>We’re finding your people</h2>
          <p>{queueMode === 'live' ? <>Your protected ride request is live for <strong>{selectedZone.name}</strong>. We’ll only reveal a group after a safe match is found.</> : <>We’re checking arrivals near <strong>{arrivalTime}</strong> travelling towards <strong>{selectedZone.name}</strong>.</>}</p>
          <div className="queue-stat"><strong>{queueMode === 'live' ? 'Live' : '2'}</strong><span>{queueMode === 'live' ? 'request safely added to the queue' : 'potential co-riders found'}</span></div>
          {queueMode === 'demo' ? <button className="primary-button" type="button" onClick={showDemoMatch}>View demo match <span aria-hidden="true">→</span></button> : null}
          <button className="text-button" type="button" onClick={resetTrip}>Edit trip details</button>
        </section>
      ) : null}

      {step === 'matched' ? (
        <section className="card match-card" aria-live="polite">
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">Your group is ready</p>
          <h2>A good route match</h2>
          <p>Everyone lands within 11 minutes and is heading towards the Powai corridor.</p>
          <div className="rider-list">
            {demoMatches.map((match) => <div className="rider" key={match.name}><span className="avatar">{match.initials}</span><div><strong>{match.name}</strong><small>{match.zone} · lands {match.arrivalOffsetMinutes} min from you</small></div><span className="verified">Verified</span></div>)}
            <div className="rider you"><span className="avatar you-avatar">YO</span><div><strong>You</strong><small>{selectedZone.name} · {luggage} luggage</small></div></div>
          </div>
          <aside className="estimate"><span>Suggested split</span><strong>{formatRupees(estimatedSplit)} each</strong><small>One person books the cab; settle after meeting.</small></aside>
          <button className="primary-button" type="button" onClick={() => window.alert('Demo only: the next version will create a consent-based group chat.')}>Approve this group <span aria-hidden="true">→</span></button>
          <button className="text-button" type="button" onClick={resetTrip}>Find another group</button>
        </section>
      ) : null}

      <footer><span>Designed for safer shared airport rides.</span><span>·</span><span>₹0 MVP prototype</span></footer>
    </main>
  )
}
