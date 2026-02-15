CREATE TABLE IF NOT EXISTS public.revenue_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id uuid REFERENCES public.mashups(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  payout_frequency text NOT NULL CHECK (payout_frequency IN ('instant', 'weekly', 'monthly')) DEFAULT 'monthly',
  minimum_payout numeric NOT NULL DEFAULT 10.00,
  platform_fee_percent numeric NOT NULL DEFAULT 15.0,
  total_revenue numeric NOT NULL DEFAULT 0,
  total_distributed numeric NOT NULL DEFAULT 0,
  total_pending numeric NOT NULL DEFAULT 0,
  chain_id text,
  contract_address text,
  transaction_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  last_distribution_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.revenue_split_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  split_id uuid NOT NULL REFERENCES public.revenue_splits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  wallet_address text,
  percentage numeric NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  role text NOT NULL CHECK (role IN ('creator', 'vocalist', 'producer', 'writer', 'other')) DEFAULT 'creator',
  verified boolean NOT NULL DEFAULT false,
  total_received numeric NOT NULL DEFAULT 0,
  last_payout_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenue_splits_mashup_idx ON public.revenue_splits (mashup_id);
CREATE INDEX IF NOT EXISTS revenue_splits_creator_idx ON public.revenue_splits (creator_id);
CREATE INDEX IF NOT EXISTS revenue_split_recipients_split_idx ON public.revenue_split_recipients (split_id);
CREATE INDEX IF NOT EXISTS revenue_split_recipients_user_idx ON public.revenue_split_recipients (user_id);

ALTER TABLE public.revenue_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_split_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view splits they participate in" ON public.revenue_splits
  FOR SELECT USING (
    creator_id = auth.uid() OR
    id IN (SELECT split_id FROM public.revenue_split_recipients WHERE user_id = auth.uid())
  );
CREATE POLICY "Creators can create splits" ON public.revenue_splits
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update own splits" ON public.revenue_splits
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can view recipient entries they're part of" ON public.revenue_split_recipients
  FOR SELECT USING (
    user_id = auth.uid() OR
    split_id IN (SELECT id FROM public.revenue_splits WHERE creator_id = auth.uid())
  );
CREATE POLICY "Split creators can manage recipients" ON public.revenue_split_recipients
  FOR INSERT WITH CHECK (
    split_id IN (SELECT id FROM public.revenue_splits WHERE creator_id = auth.uid())
  );
