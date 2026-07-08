
CREATE TYPE public.mezmur_kind AS ENUM ('audio','video');
CREATE TYPE public.mezmur_status AS ENUM ('pending','approved');

CREATE TABLE public.mezmur_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  kind public.mezmur_kind NOT NULL,
  category TEXT,
  file_path TEXT,
  external_url TEXT,
  status public.mezmur_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mezmur_items TO authenticated;
GRANT ALL ON public.mezmur_items TO service_role;

ALTER TABLE public.mezmur_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved or own" ON public.mezmur_items FOR SELECT TO authenticated
  USING (status = 'approved' OR uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Insert own" ON public.mezmur_items FOR INSERT TO authenticated
  WITH CHECK (uploader_id = auth.uid());
CREATE POLICY "Update own or admin" ON public.mezmur_items FOR UPDATE TO authenticated
  USING (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (uploader_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin delete" ON public.mezmur_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER update_mezmur_items_updated_at BEFORE UPDATE ON public.mezmur_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for mezmur bucket
CREATE POLICY "mezmur read auth" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'mezmur');
CREATE POLICY "mezmur insert own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mezmur' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "mezmur update own or admin" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'mezmur' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "mezmur delete own or admin" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mezmur' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
