
CREATE TYPE public.donation_status AS ENUM ('pending','approved','rejected');

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  donor_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ETB',
  method TEXT NOT NULL,
  reference TEXT,
  purpose TEXT,
  note TEXT,
  proof_path TEXT,
  status public.donation_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or admin" ON public.donations FOR SELECT TO authenticated
  USING (donor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Insert own" ON public.donations FOR INSERT TO authenticated
  WITH CHECK (donor_id = auth.uid());
CREATE POLICY "Update own pending or admin" ON public.donations FOR UPDATE TO authenticated
  USING ((donor_id = auth.uid() AND status = 'pending') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK ((donor_id = auth.uid() AND status = 'pending') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete" ON public.donations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "donations read auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'donations' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "donations insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'donations' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "donations delete own or admin" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'donations' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
