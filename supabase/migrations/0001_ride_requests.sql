-- Run this file in the Supabase SQL Editor after creating a free project.
-- The app only uses the public anon key; never put a service_role key in React.

create type public.ride_request_status as enum (
  'SEARCHING',
  'MATCHED',
  'CANCELLED',
  'COMPLETED'
);

create type public.luggage_size as enum ('light', 'standard');

create table public.ride_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_number text not null check (char_length(flight_number) between 2 and 12),
  expected_arrival time not null,
  terminal text not null check (terminal in ('T1', 'T2')),
  dropoff_zone_id text not null check (dropoff_zone_id in ('powai', 'thane', 'andheri', 'navi-mumbai')),
  luggage_size public.luggage_size not null default 'standard',
  status public.ride_request_status not null default 'SEARCHING',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ride_requests_searching_match_idx
  on public.ride_requests (terminal, dropoff_zone_id, expected_arrival)
  where status = 'SEARCHING';

alter table public.ride_requests enable row level security;

create policy "Users can read their own ride requests"
  on public.ride_requests for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own ride requests"
  on public.ride_requests for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can change their own ride requests"
  on public.ride_requests for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter publication supabase_realtime add table public.ride_requests;
