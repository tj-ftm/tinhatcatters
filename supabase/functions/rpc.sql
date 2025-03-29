
-- Create a security-definer function to set the wallet address for Row Level Security
CREATE OR REPLACE FUNCTION public.set_wallet_address(wallet_address TEXT)
RETURNS VOID AS $$
BEGIN
  -- Set the wallet address as a session variable for RLS policies
  PERFORM set_config('app.current_wallet_address', wallet_address, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
