-- Elvia review intelligence schema
-- Run this once against your Postgres database to create all tables.

create table if not exists properties (
  id serial primary key,
  name text not null unique,
  brand text not null check (brand in ('gamewatchers', 'porini'))
);

create table if not exists competitors (
  id serial primary key,
  name text not null unique
);

create table if not exists reviews (
  id serial primary key,
  property_id integer references properties(id),
  competitor_id integer references competitors(id),
  platform text not null check (platform in ('google', 'trustpilot', 'tripadvisor')),
  external_review_id text not null,
  author text,
  rating integer,
  review_date date,
  text text,
  sentiment_score numeric,
  themes jsonb default '[]'::jsonb,
  needs_response boolean default false,
  flag_reason text,
  response_status text default 'unanswered' check (response_status in ('unanswered', 'drafted', 'sent')),
  draft_reply text,
  handled_by text,
  handled_at timestamptz,
  ingested_at timestamptz not null default now(),

  -- exactly one of property_id / competitor_id must be set — a review belongs
  -- to either one of our own properties or a tracked competitor, never both/neither
  constraint reviews_owner_check check (
    (property_id is not null and competitor_id is null) or
    (property_id is null and competitor_id is not null)
  ),

  -- same platform review pulled twice (e.g. re-running a fetch job) should not duplicate
  constraint reviews_dedupe_key unique (platform, external_review_id)
);

create index if not exists idx_reviews_property_id on reviews(property_id);
create index if not exists idx_reviews_competitor_id on reviews(competitor_id);
create index if not exists idx_reviews_needs_response on reviews(needs_response) where needs_response = true;
create index if not exists idx_reviews_review_date on reviews(review_date);

create table if not exists digest_runs (
  id serial primary key,
  week_start date not null,
  week_end date not null,
  summary_text text,
  sent_at timestamptz
);
