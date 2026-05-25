create table if not exists public.editorial_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  homepage_url text,
  feed_url text not null unique,
  source_type text not null default 'rss' check (source_type in ('rss')),
  category text,
  region text,
  language text,
  reliability_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.editorial_sources(id) on delete set null,
  source_name text not null,
  source_url text,
  original_url text not null,
  original_title text not null,
  original_excerpt text,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  content_hash text,
  category text,
  region text,
  language text,
  status text not null default 'candidate' check (status in ('candidate', 'selected', 'rejected', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (original_url)
);

create index if not exists editorial_items_published_at_idx on public.editorial_items (published_at desc nulls last);
create index if not exists editorial_items_status_idx on public.editorial_items (status);
create index if not exists editorial_items_content_hash_idx on public.editorial_items (content_hash);

alter table public.editorial_sources enable row level security;
alter table public.editorial_items enable row level security;

drop policy if exists "Public read active editorial sources" on public.editorial_sources;
create policy "Public read active editorial sources" on public.editorial_sources
  for select using (is_active = true);

drop policy if exists "Public read candidate editorial items" on public.editorial_items;
create policy "Public read candidate editorial items" on public.editorial_items
  for select using (status in ('candidate', 'selected'));

insert into public.editorial_sources (name, homepage_url, feed_url, source_type, category, region, language, reliability_note, is_active)
values
  ('OpenAI News', 'https://openai.com/news/', 'https://openai.com/news/rss.xml', 'rss', 'Official AI labs', 'Global', 'en', 'Official OpenAI news RSS feed. Source-provided titles and excerpts only.', true),
  ('Google AI Blog', 'https://blog.google/technology/ai/', 'https://blog.google/technology/ai/rss/', 'rss', 'Official AI labs', 'Global', 'en', 'Official Google AI blog RSS feed. Source-provided titles and excerpts only.', true),
  ('Google DeepMind Blog', 'https://deepmind.google/blog/', 'https://deepmind.google/blog/rss.xml', 'rss', 'Official AI labs', 'Global', 'en', 'Official Google DeepMind blog RSS feed. Source-provided titles and excerpts only.', true),
  ('arXiv cs.AI', 'https://arxiv.org/list/cs.AI/recent', 'https://export.arxiv.org/rss/cs.AI', 'rss', 'Developer/research sources', 'Global', 'en', 'arXiv computer science AI category RSS feed. Research metadata, not editorial endorsement.', true),
  ('The Verge AI', 'https://www.theverge.com/ai-artificial-intelligence', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'rss', 'AI product/tools media', 'US', 'en', 'Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.', true),
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'rss', 'AI product/tools media', 'US', 'en', 'Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.', true),
  ('MIT Technology Review AI', 'https://www.technologyreview.com/topic/artificial-intelligence/', 'https://www.technologyreview.com/topic/artificial-intelligence/feed/', 'rss', 'AI product/tools media', 'US', 'en', 'Technology Review AI topic RSS feed. Source-provided titles and excerpts only.', true),
  ('VentureBeat AI', 'https://venturebeat.com/category/ai/', 'https://venturebeat.com/category/ai/feed', 'rss', 'AI product/tools media', 'US', 'en', 'Technology media RSS feed for AI coverage. Source-provided titles and excerpts only.', true)
on conflict (feed_url) do update
set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  source_type = excluded.source_type,
  category = excluded.category,
  region = excluded.region,
  language = excluded.language,
  reliability_note = excluded.reliability_note,
  is_active = excluded.is_active,
  updated_at = now();
