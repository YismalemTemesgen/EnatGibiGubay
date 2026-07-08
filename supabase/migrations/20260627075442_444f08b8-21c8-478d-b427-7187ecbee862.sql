
CREATE TYPE public.history_kind AS ENUM ('history','report','plan','future_plan','section_control');

CREATE TABLE public.history_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.history_kind NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  year TEXT,
  section TEXT,
  file_path TEXT,
  external_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.history_entries TO authenticated;
GRANT ALL ON public.history_entries TO service_role;

ALTER TABLE public.history_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth view history" ON public.history_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin insert history" ON public.history_entries FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update history" ON public.history_entries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete history" ON public.history_entries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_history_entries_updated BEFORE UPDATE ON public.history_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "auth read history files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id='history');
CREATE POLICY "admin upload history files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='history' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update history files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='history' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete history files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='history' AND public.has_role(auth.uid(),'admin'));
