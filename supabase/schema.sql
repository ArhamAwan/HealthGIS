-- HealthGIS Supabase Schema
-- Run this in the Supabase SQL Editor to set up the database

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  email text not null default '',
  role text not null default 'patient' check (role in ('patient', 'admin')),
  phone text default '',
  date_of_birth text default '',
  gender text default '',
  weight text default '',
  height text default '',
  blood_type text default '',
  allergies text default '',
  emergency_contact_name text default '',
  emergency_contact_phone text default '',
  avatar_url text default '',
  created_at timestamptz default now()
);

-- Hospitals table
create table if not exists public.hospitals (
  id text primary key,
  name text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz default now()
);

-- Doctors table
create table if not exists public.doctors (
  id text primary key,
  name text not null,
  specialty text not null,
  hospital_id text references public.hospitals(id) on delete set null,
  experience integer not null default 0,
  fee integer not null default 0,
  available_slots jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Appointments table
create table if not exists public.appointments (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  doctor_id text references public.doctors(id) on delete set null,
  doctor_name text not null,
  specialty text not null,
  hospital_id text references public.hospitals(id) on delete set null,
  hospital_name text not null,
  hospital_address text default '',
  date text not null,
  time_slot text not null,
  status text not null default 'Confirmed',
  created_at timestamptz default now()
);

-- User settings table
create table if not exists public.user_settings (
  user_id uuid references auth.users on delete cascade primary key,
  notifications boolean default true,
  theme text default 'system'
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.hospitals enable row level security;
alter table public.doctors enable row level security;
alter table public.appointments enable row level security;
alter table public.user_settings enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Hospitals policies (public read, admin write)
create policy "Anyone can view hospitals"
  on public.hospitals for select
  using (true);

create policy "Admins can insert hospitals"
  on public.hospitals for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update hospitals"
  on public.hospitals for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete hospitals"
  on public.hospitals for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Doctors policies (public read, admin write)
create policy "Anyone can view doctors"
  on public.doctors for select
  using (true);

create policy "Admins can insert doctors"
  on public.doctors for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update doctors"
  on public.doctors for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete doctors"
  on public.doctors for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Appointments policies
create policy "Users can view own appointments"
  on public.appointments for select
  using (auth.uid() = user_id);

create policy "Users can insert own appointments"
  on public.appointments for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all appointments"
  on public.appointments for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- User settings policies
create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
