-- Create investments table
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  currency VARCHAR(10) NOT NULL,
  currency_name VARCHAR(100) NOT NULL,
  amount DECIMAL(15, 4) NOT NULL,
  buy_price DECIMAL(15, 4) NOT NULL,
  buy_date DATE NOT NULL,
  current_value DECIMAL(15, 4) NOT NULL,
  profit DECIMAL(15, 4) NOT NULL,
  profit_percent DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_currency ON public.investments(currency);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON public.investments(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own investments
CREATE POLICY "Users can view own investments" ON public.investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments" ON public.investments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments" ON public.investments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments" ON public.investments
  FOR DELETE USING (auth.uid() = user_id);