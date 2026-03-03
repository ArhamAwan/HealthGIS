-- Fix: Drop the recursive admin policy that causes 500 errors
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate simple, non-recursive policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- For admin access, use auth.jwt() metadata instead of querying profiles table
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Also fix the insert policy so the trigger can create profiles
DROP POLICY IF EXISTS "Enable insert for trigger" ON public.profiles;
CREATE POLICY "Enable insert for trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);
