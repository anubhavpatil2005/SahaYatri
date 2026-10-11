# SahaYatri

SahaYatri is a mobile-first prototype for sharing airport rides with people
arriving at a similar time and travelling toward the same Mumbai corridor.

## What works now

- Flight, arrival time, terminal, luggage and destination-zone selection
- Mumbai pilot zones: Powai, Thane, Andheri and Navi Mumbai
- Estimated three-person fare split
- Queue and matched-group demo states
- Responsive PWA-ready React interface

The current matching data is deliberately local demo data. This lets the
product flow be tested before connecting paid flight, maps, SMS, KYC or cab
booking services.

## Run locally

```bash
npm install
npm run dev
```

Open the address shown in your terminal, normally `http://localhost:5173`.

## Production build

```bash
npm run build
```

The deployable static application is generated in `dist/`.

## Free deployment: Cloudflare Pages

1. Create a free Cloudflare account and connect this GitHub repository.
2. Create a **Pages** project from the repository.
3. Set build command to `npm run build`.
4. Set build output directory to `dist`.
5. Deploy. Cloudflare provides a free `pages.dev` URL.

## Next milestone: real shared queue

Create a free Supabase project, then add its public URL and anon key as
environment variables. The planned integration will use Supabase PostgreSQL
for ride requests and Supabase Realtime for live queue updates, avoiding a
separate Redis server for the pilot.

### Connect Supabase

1. Create a project at [Supabase](https://supabase.com/).
2. In the SQL Editor, run `supabase/migrations/0001_ride_requests.sql`.
3. Copy `.env.example` to `.env` and fill in the **Project URL** and
   **anon/publishable key** from Project Settings → API.
4. Enable Email authentication in Supabase before connecting the live queue.

The migration enables Row Level Security. A passenger can only create, read,
or update their own ride request; the matching service will be added later as
a trusted server-side function.

Never commit provider keys, database passwords or payment secrets to Git.
