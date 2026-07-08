
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  attachment_url TEXT,
  attachment_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO authenticated;
GRANT ALL ON public.notices TO service_role;

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notices viewable by authenticated"
  ON public.notices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can post notices"
  ON public.notices FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author or admin can update notices"
  ON public.notices FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = author_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete notices"
  ON public.notices FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for the notices bucket (bucket created via tool)
CREATE POLICY "Notices files public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'notices');

CREATE POLICY "Authenticated upload notices files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'notices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins delete notices files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'notices' AND public.has_role(auth.uid(), 'admin'));
