
-- 1. Remove the dangerous auto_assign_admin_role triggers and function
DROP TRIGGER IF EXISTS on_profile_created_assign_admin ON public.profiles;
DROP TRIGGER IF EXISTS assign_admin_on_profile_create ON public.profiles;
DROP TRIGGER IF EXISTS auto_assign_admin_on_profile ON public.profiles;
DROP FUNCTION IF EXISTS public.auto_assign_admin_role() CASCADE;

-- 2. Fix user_roles RLS
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix profiles: restrict balance updates by users
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile safely" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND balance = (SELECT p.balance FROM public.profiles p WHERE p.user_id = auth.uid())
    AND is_suspended = (SELECT p.is_suspended FROM public.profiles p WHERE p.user_id = auth.uid())
  );

-- 4. Fix products SELECT policy
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);
