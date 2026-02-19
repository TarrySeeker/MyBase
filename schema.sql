-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PRODUCTS
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  price numeric not null check (price >= 0),
  description text,
  images text[] default array[]::text[],
  category text,
  seo_title text,
  seo_description text,
  is_active boolean default true
);
create index products_category_idx on public.products (category);
create index products_is_active_idx on public.products (is_active);
create index products_created_at_idx on public.products (created_at);

-- ORDERS
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new' check (status in ('new', 'processing', 'completed', 'cancelled')),
  customer_info jsonb default '{}'::jsonb, -- name, phone, email, address
  items jsonb default '[]'::jsonb, -- array of product objects with calculated price
  total numeric not null default 0 check (total >= 0),
  user_id uuid references auth.users(id) -- optional, if registered
);
create index orders_status_idx on public.orders (status);
create index orders_created_at_idx on public.orders (created_at);
create index orders_user_id_idx on public.orders (user_id);

-- APPLICATIONS (Web Form Submissions)
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'new' check (status in ('new', 'processing', 'archived')),
  fio text,
  phone text,
  cdek_contract text,
  business_info jsonb default '{}'::jsonb, -- industry, products, current_site
  project_details jsonb default '{}'::jsonb, -- goals, tasks, solution_type, counts
  design_preferences jsonb default '{}'::jsonb -- type, mockup_choice
);
create index applications_status_idx on public.applications (status);
create index applications_created_at_idx on public.applications (created_at);

-- CMS CONTENT
create table public.cms_content (
  key text primary key, -- e.g., 'home_hero', 'contact_info'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content jsonb default '{}'::jsonb
);

-- PROMO CODES
create table public.promo_codes (
  code text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  discount_type text check (discount_type in ('fixed', 'percent')),
  value numeric not null check (value > 0),
  is_active boolean default true,
  constraint value_percent_check check (
    (discount_type = 'percent' and value <= 100) or (discount_type = 'fixed')
  )
);
create index promo_codes_code_idx on public.promo_codes (code);

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

-- OPEN ACCESS FOR ADMINS
create policy "Enable all access for authenticated users" on public.products for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.products for select using (true);

create policy "Enable all access for authenticated users" on public.orders for all using (auth.role() = 'authenticated');
create policy "Enable insert for everyone" on public.orders for insert with check (true);

create policy "Enable all access for authenticated users" on public.applications for all using (auth.role() = 'authenticated');
create policy "Enable insert for everyone" on public.applications for insert with check (true);

create policy "Enable all access for authenticated users" on public.cms_content for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.cms_content for select using (true);

create policy "Enable all access for authenticated users" on public.promo_codes for all using (auth.role() = 'authenticated');
create policy "Enable read access for all users" on public.promo_codes for select using (true);

-- STORAGE POLICIES
create policy "Public Access" on storage.objects for select using ( bucket_id in ('products', 'content') );
create policy "Auth Upload" on storage.objects for insert with check ( bucket_id in ('products', 'content') and auth.role() = 'authenticated' );

-- TRIGGERS FOR UPDATED_AT
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at_products before update on public.products for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_orders before update on public.orders for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_applications before update on public.applications for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_cms_content before update on public.cms_content for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at_promo_codes before update on public.promo_codes for each row execute procedure public.handle_updated_at();
