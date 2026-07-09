-- Prevent browser clients from escalating profile trust/admin fields.

DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile."
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF (SELECT auth.role()) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.role IS DISTINCT FROM NEW.role
    OR OLD.is_verified IS DISTINCT FROM NEW.is_verified
    OR OLD.official_partner_name IS DISTINCT FROM NEW.official_partner_name
    OR OLD.official_partner_logo IS DISTINCT FROM NEW.official_partner_logo
    OR OLD.official_partner_url IS DISTINCT FROM NEW.official_partner_url
    OR OLD.barengan_custom_tag IS DISTINCT FROM NEW.barengan_custom_tag
    OR OLD.barengan_trust_score IS DISTINCT FROM NEW.barengan_trust_score
  THEN
    RAISE EXCEPTION 'Only server-side admin operations can update privileged profile fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

REVOKE ALL ON FUNCTION public.prevent_profile_privilege_escalation() FROM PUBLIC;
