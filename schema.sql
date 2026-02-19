-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  price numeric not null,
  description text,
  images text[] default array[]::text[],
  category text,
  seo_title text,
  seo_description text,
  is_active boolean default true
);

-- ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new' check (status in ('new', 'processing', 'completed', 'cancelled')),
  customer_info jsonb default '{}'::jsonb, -- name, phone, email, address
  items jsonb default '[]'::jsonb, -- array of product objects with calculated price
  total numeric not null default 0,
  user_id uuid references auth.users(id) -- optional, if registered
);

-- APPLICATIONS (Web Form Submissions)
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new' check (status in ('new', 'processing', 'archived')),
  fio text,
  phone text,
  cdek_contract text,
  business_info jsonb default '{}'::jsonb, -- industry, products, current_site
  project_details jsonb default '{}'::jsonb, -- goals, tasks, solution_type, counts
  design_preferences jsonb default '{}'::jsonb -- type, mockup_choice
);

-- CMS CONTENT
create table public.cms_content (
  key text primary key, -- e.g., 'home_hero', 'contact_info'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content jsonb default '{}'::jsonb
);

-- PROMO CODES
create table public.promo_codes (
  code text primary key,
  discount_type text check (discount_type in ('fixed', 'percent')),
  value numeric not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('content', 'content', true)
on conflict (id) do nothing;

-- SECURITY POLICIES (RLS)
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.applications enable row level security;
alter table public.cms_content enable row level security;
alter table public.promo_codes enable row level security;

-- OPEN ACCESS FOR ADMINS (Simplified for now, assumes authenticated users are admins)
-- Ideally, create an 'admin' role or check email domain.
create policy "Enable all access for authenticated users" on public.products for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.products for select using (true);

create policy "Enable all access for authenticated users" on public.orders for all using (auth.role() = 'authenticated');
create policy "Enable insert for everyone" on public.orders for insert with check (true); -- Public can create orders

create policy "Enable all access for authenticated users" on public.applications for all using (auth.role() = 'authenticated');
create policy "Enable insert for everyone" on public.applications for insert with check (true); -- Public can submit applications

create policy "Enable all access for authenticated users" on public.cms_content for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.cms_content for select using (true);

create policy "Enable all access for authenticated users" on public.promo_codes for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.promo_codes for select using (true);

-- STORAGE POLICIES
create policy "Public Access" on storage.objects for select using ( bucket_id in ('products', 'content') );
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id in ('products', 'content') and auth.role() = 'authenticated' );
