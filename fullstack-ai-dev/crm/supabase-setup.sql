-- ═══════════════════════════════════════════════════════════════════════════
-- MyCRM — Complete Database Setup
-- Run this entire file in Supabase SQL Editor
-- Prestige Platform · Full-Stack AI Dev Course
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists contacts (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  company     text,
  job_title   text,
  status      text default 'active'
                check (status in ('active', 'inactive', 'prospect')),
  tags        text[],
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create table if not exists deals (
  id                   uuid default uuid_generate_v4() primary key,
  user_id              uuid references auth.users(id) on delete cascade not null,
  contact_id           uuid references contacts(id) on delete cascade not null,
  title                text not null,
  value                numeric(12, 2) default 0,
  currency             text default 'ZAR',
  stage                text not null default 'lead'
                         check (stage in ('lead', 'qualified', 'proposal', 'won', 'lost')),
  probability          integer default 0 check (probability between 0 and 100),
  description          text,
  expected_close_date  date,
  closed_at            timestamptz,
  created_at           timestamptz default now() not null,
  updated_at           timestamptz default now() not null
);

create table if not exists notes (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  contact_id  uuid references contacts(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now() not null
);

create table if not exists activities (
  id           uuid default uuid_generate_v4() primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  contact_id   uuid references contacts(id) on delete cascade,
  deal_id      uuid references deals(id) on delete cascade,
  type         text not null
                 check (type in (
                   'contact_created', 'contact_updated',
                   'deal_created', 'deal_updated', 'deal_stage_changed',
                   'note_added'
                 )),
  description  text not null,
  metadata     jsonb,
  created_at   timestamptz default now() not null
);


-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists contacts_user_id_idx      on contacts(user_id);
create index if not exists contacts_email_idx        on contacts(email);
create index if not exists deals_user_id_idx         on deals(user_id);
create index if not exists deals_contact_id_idx      on deals(contact_id);
create index if not exists deals_stage_idx           on deals(stage);
create index if not exists notes_contact_id_idx      on notes(contact_id);
create index if not exists activities_user_id_idx    on activities(user_id);
create index if not exists activities_contact_id_idx on activities(contact_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

alter table contacts   enable row level security;
alter table deals      enable row level security;
alter table notes      enable row level security;
alter table activities enable row level security;

-- Drop existing policies if rerunning
drop policy if exists "contacts: own data only"   on contacts;
drop policy if exists "deals: own data only"      on deals;
drop policy if exists "notes: own data only"      on notes;
drop policy if exists "activities: own data only" on activities;

create policy "contacts: own data only"
  on contacts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "deals: own data only"
  on deals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notes: own data only"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "activities: own data only"
  on activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS — auto-update updated_at
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists contacts_updated_at on contacts;
drop trigger if exists deals_updated_at    on deals;

create trigger contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

create trigger deals_updated_at
  before update on deals
  for each row execute function update_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
-- DEMO SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────
-- Instructions:
-- 1. Create a demo user account at /signup with email: demo@mycrm.app
-- 2. Go to Supabase Authentication → Users, copy the demo user's UUID
-- 3. Replace ALL occurrences of 'REPLACE_WITH_DEMO_USER_ID' below with that UUID
-- 4. Run this entire block in the SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

do $$
declare
  demo_user_id uuid := 'REPLACE_WITH_DEMO_USER_ID';

  -- Contact IDs
  c1 uuid := uuid_generate_v4();
  c2 uuid := uuid_generate_v4();
  c3 uuid := uuid_generate_v4();
  c4 uuid := uuid_generate_v4();
  c5 uuid := uuid_generate_v4();
  c6 uuid := uuid_generate_v4();

  -- Deal IDs
  d1 uuid := uuid_generate_v4();
  d2 uuid := uuid_generate_v4();
  d3 uuid := uuid_generate_v4();
  d4 uuid := uuid_generate_v4();
  d5 uuid := uuid_generate_v4();
  d6 uuid := uuid_generate_v4();
  d7 uuid := uuid_generate_v4();
  d8 uuid := uuid_generate_v4();

begin

  -- ── CONTACTS ────────────────────────────────────────────────────────────

  insert into contacts (id, user_id, first_name, last_name, email, phone, company, job_title, created_at)
  values
    (c1, demo_user_id, 'Thabo',    'Nkosi',    'thabo@apexlogistics.co.za',  '+27 82 345 6789', 'Apex Logistics SA',   'Operations Director',   now() - interval '45 days'),
    (c2, demo_user_id, 'Priya',    'Govender',  'priya@brightfinance.co.za',  '+27 71 234 5678', 'Bright Finance Group','CFO',                   now() - interval '32 days'),
    (c3, demo_user_id, 'Zanele',   'Dlamini',   'zanele@zdsolutions.co.za',   '+27 83 456 7890', 'ZD Solutions',        'Managing Director',     now() - interval '28 days'),
    (c4, demo_user_id, 'Marco',    'van Niekerk','marco@solartech.co.za',     '+27 76 567 8901', 'SolarTech Africa',    'Head of Procurement',   now() - interval '19 days'),
    (c5, demo_user_id, 'Ayasha',   'Patel',     'ayasha@medplus.co.za',       '+27 84 678 9012', 'MedPlus Group',       'IT Director',           now() - interval '12 days'),
    (c6, demo_user_id, 'Lebo',     'Mokoena',   'lebo@innovateZA.co.za',      '+27 79 789 0123', 'Innovate ZA',         'CEO',                   now() - interval '5 days');


  -- ── DEALS ───────────────────────────────────────────────────────────────

  insert into deals (id, user_id, contact_id, title, value, stage, description, expected_close_date, created_at)
  values
    -- Thabo / Apex Logistics
    (d1, demo_user_id, c1, 'Fleet Management Software Licence', 85000, 'proposal',
     'Annual licence for 120-vehicle fleet tracking and route optimisation system.',
     now()::date + 21, now() - interval '30 days'),

    (d2, demo_user_id, c1, 'Driver Training Module Add-on', 18500, 'qualified',
     'Optional e-learning module for driver compliance training. Thabo mentioned Q3 budget availability.',
     now()::date + 45, now() - interval '15 days'),

    -- Priya / Bright Finance
    (d3, demo_user_id, c2, 'CFO Dashboard Implementation', 120000, 'proposal',
     'Custom financial reporting dashboard with real-time Supabase integration. Board presentation scheduled.',
     now()::date + 14, now() - interval '25 days'),

    -- Zanele / ZD Solutions
    (d4, demo_user_id, c3, 'AI Workflow Automation Suite', 55000, 'qualified',
     'Automating their client onboarding process using Claude API. Pilot proposed for 30 clients.',
     now()::date + 30, now() - interval '20 days'),

    -- Marco / SolarTech
    (d5, demo_user_id, c4, 'Solar Asset Management Platform', 200000, 'won',
     'Full platform for managing 800+ solar installations across 3 provinces. Signed last week.',
     now()::date - 5, now() - interval '60 days'),

    (d6, demo_user_id, c4, 'Mobile Field Technician App', 45000, 'lead',
     'Companion mobile app for field technicians to log installations and faults.',
     now()::date + 60, now() - interval '3 days'),

    -- Ayasha / MedPlus
    (d7, demo_user_id, c5, 'Hospital IT Infrastructure Audit', 35000, 'lead',
     'Comprehensive IT audit across 4 hospitals ahead of their ERP migration.',
     now()::date + 90, now() - interval '10 days'),

    -- Lebo / Innovate ZA
    (d8, demo_user_id, c6, 'Startup Studio CRM Customisation', 28000, 'lost',
     'Custom CRM for their incubator portfolio. Lost to in-house build decision.',
     null, now() - interval '20 days');


  -- ── NOTES ───────────────────────────────────────────────────────────────

  insert into notes (user_id, contact_id, content, created_at)
  values
    -- Thabo notes
    (demo_user_id, c1,
     'Had a great discovery call. Thabo is frustrated with their current Excel-based tracking — 3 separate spreadsheets for different depots. He wants a single dashboard. Strong pain point.',
     now() - interval '28 days'),
    (demo_user_id, c1,
     'Sent proposal doc. He said CFO needs to approve anything over R50k. Suggested I speak directly to CFO before end of month. Need to follow up.',
     now() - interval '10 days'),
    (demo_user_id, c1,
     'Brief WhatsApp exchange — CFO is on leave until next week. Thabo confirmed budget is available in Q3. Staying warm.',
     now() - interval '3 days'),

    -- Priya notes
    (demo_user_id, c2,
     'Priya is detail-oriented and technically sharp. She asked good questions about data residency and POPIA compliance. Need to prepare a written response.',
     now() - interval '20 days'),
    (demo_user_id, c2,
     'Sent POPIA compliance documentation. She replied quickly — very positive. Board demo scheduled for next Tuesday at 10am.',
     now() - interval '7 days'),

    -- Zanele notes
    (demo_user_id, c3,
     'Met Zanele at the Cape Town AI Summit. She runs an 8-person consultancy and is overwhelmed with manual client onboarding. Warm lead from networking.',
     now() - interval '26 days'),
    (demo_user_id, c3,
     'Demo went well. She loved the Claude integration. Main concern is the monthly API cost at scale. Prepared a cost-per-client breakdown to address this.',
     now() - interval '12 days'),

    -- Marco notes
    (demo_user_id, c4,
     'Marco signed the Solar Asset Management Platform. R200k deal — biggest of the quarter. He moved fast once he saw the demo. Excellent reference client.',
     now() - interval '5 days'),

    -- Ayasha notes
    (demo_user_id, c5,
     'Intro call — Ayasha has a clear brief. 4 hospitals, all running different legacy systems. ERP migration planned for Q1 next year. Audit needed first.',
     now() - interval '10 days'),

    -- Lebo notes
    (demo_user_id, c6,
     'Lost this one. Their CTO decided to build in-house using a junior developer. Underpriced decision — they will likely come back in 6 months. Noted to follow up Q1 next year.',
     now() - interval '4 days');


  -- ── ACTIVITIES ──────────────────────────────────────────────────────────

  insert into activities (user_id, contact_id, deal_id, type, description, metadata, created_at)
  values
    -- Thabo
    (demo_user_id, c1, null,  'contact_created',    'Contact created: Thabo Nkosi',             null, now() - interval '45 days'),
    (demo_user_id, c1, d1,   'deal_created',        'Deal created: Fleet Management Software Licence', '{"stage":"lead","value":85000}',  now() - interval '30 days'),
    (demo_user_id, c1, d1,   'deal_stage_changed',  'Deal moved: Fleet Management Software Licence → qualified', '{"from":"lead","to":"qualified"}', now() - interval '22 days'),
    (demo_user_id, c1, d1,   'deal_stage_changed',  'Deal moved: Fleet Management Software Licence → proposal',  '{"from":"qualified","to":"proposal"}', now() - interval '10 days'),
    (demo_user_id, c1, d2,   'deal_created',        'Deal created: Driver Training Module Add-on',      '{"stage":"qualified","value":18500}', now() - interval '15 days'),
    (demo_user_id, c1, null, 'note_added',           'Note added', '{"preview":"Had a great discovery call."}', now() - interval '28 days'),
    (demo_user_id, c1, null, 'note_added',           'Note added', '{"preview":"Sent proposal doc."}',          now() - interval '10 days'),
    (demo_user_id, c1, null, 'note_added',           'Note added', '{"preview":"Brief WhatsApp exchange."}',     now() - interval '3 days'),

    -- Priya
    (demo_user_id, c2, null, 'contact_created',     'Contact created: Priya Govender',          null, now() - interval '32 days'),
    (demo_user_id, c2, d3,  'deal_created',         'Deal created: CFO Dashboard Implementation', '{"stage":"lead","value":120000}', now() - interval '25 days'),
    (demo_user_id, c2, d3,  'deal_stage_changed',   'Deal moved: CFO Dashboard Implementation → qualified', '{"from":"lead","to":"qualified"}', now() - interval '18 days'),
    (demo_user_id, c2, d3,  'deal_stage_changed',   'Deal moved: CFO Dashboard Implementation → proposal',  '{"from":"qualified","to":"proposal"}', now() - interval '7 days'),
    (demo_user_id, c2, null,'note_added',            'Note added', '{"preview":"Priya is detail-oriented."}', now() - interval '20 days'),
    (demo_user_id, c2, null,'note_added',            'Note added', '{"preview":"Sent POPIA compliance documentation."}', now() - interval '7 days'),

    -- Zanele
    (demo_user_id, c3, null, 'contact_created',     'Contact created: Zanele Dlamini',          null, now() - interval '28 days'),
    (demo_user_id, c3, d4,  'deal_created',         'Deal created: AI Workflow Automation Suite','{"stage":"lead","value":55000}', now() - interval '20 days'),
    (demo_user_id, c3, d4,  'deal_stage_changed',   'Deal moved: AI Workflow Automation Suite → qualified', '{"from":"lead","to":"qualified"}', now() - interval '12 days'),
    (demo_user_id, c3, null,'note_added',            'Note added', '{"preview":"Met Zanele at the Cape Town AI Summit."}', now() - interval '26 days'),

    -- Marco
    (demo_user_id, c4, null, 'contact_created',     'Contact created: Marco van Niekerk',       null, now() - interval '19 days'),
    (demo_user_id, c4, d5,  'deal_created',         'Deal created: Solar Asset Management Platform', '{"stage":"lead","value":200000}', now() - interval '60 days'),
    (demo_user_id, c4, d5,  'deal_stage_changed',   'Deal moved: Solar Asset Management → won', '{"from":"proposal","to":"won"}', now() - interval '5 days'),
    (demo_user_id, c4, d6,  'deal_created',         'Deal created: Mobile Field Technician App','{"stage":"lead","value":45000}', now() - interval '3 days'),
    (demo_user_id, c4, null,'note_added',            'Note added', '{"preview":"Marco signed the Solar Asset Management Platform."}', now() - interval '5 days'),

    -- Ayasha
    (demo_user_id, c5, null, 'contact_created',     'Contact created: Ayasha Patel',            null, now() - interval '12 days'),
    (demo_user_id, c5, d7,  'deal_created',         'Deal created: Hospital IT Infrastructure Audit', '{"stage":"lead","value":35000}', now() - interval '10 days'),
    (demo_user_id, c5, null,'note_added',            'Note added', '{"preview":"Intro call — Ayasha has a clear brief."}', now() - interval '10 days'),

    -- Lebo
    (demo_user_id, c6, null, 'contact_created',     'Contact created: Lebo Mokoena',            null, now() - interval '5 days'),
    (demo_user_id, c6, d8,  'deal_created',         'Deal created: Startup Studio CRM Customisation', '{"stage":"lead","value":28000}', now() - interval '20 days'),
    (demo_user_id, c6, d8,  'deal_stage_changed',   'Deal moved: Startup Studio CRM → lost',    '{"from":"qualified","to":"lost"}', now() - interval '4 days'),
    (demo_user_id, c6, null,'note_added',            'Note added', '{"preview":"Lost this one."}', now() - interval '4 days');

end $$;
