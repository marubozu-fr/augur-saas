-- subscriptions table
-- Mirrors Stripe subscription state, synced via Stripe webhooks.
-- Written by the webhook handler using the service-role key (bypasses RLS).

create table public.subscriptions (
  id                   text        primary key, -- Stripe subscription id (sub_...)
  user_id              uuid        not null references auth.users(id) on delete cascade,
  status               text        not null,    -- active, canceled, past_due, trialing, etc.
  price_id             text,                    -- Stripe price id (price_...)
  product_id           text,                    -- Stripe product id (prod_...)
  tier                 text,                    -- copied from product metadata: "1", "2", "3", "4"
  current_period_end   timestamptz,
  cancel_at_period_end boolean     default false,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Index the foreign key: the common query is "fetch a given user's subscription".
create index idx_subscriptions_user_id on public.subscriptions(user_id);

-- Enable Row Level Security
alter table public.subscriptions enable row level security;

-- Users can read their own subscription.
-- Webhook writes use the service-role key which bypasses RLS entirely,
-- so no insert/update policy is needed for users.
create policy "Users can select own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);
