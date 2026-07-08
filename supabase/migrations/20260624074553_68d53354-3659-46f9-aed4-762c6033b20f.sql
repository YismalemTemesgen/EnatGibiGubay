
CREATE TYPE public.library_kind AS ENUM ('pdf', 'video');
CREATE TYPE public.library_status AS ENUM ('pending', 'approved');

CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  uploader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  kind public.library_kind NOT NULL,
  category TEXT,
  file_path TEXT,
  external_url TEXT,
  status public.library_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_items TO authenticated;
GRANT ALL ON public.library_items TO service_role;

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View approved or own or admin"
  ON public.library_items FOR SELECT TO authenticated
  USING (status = 'approved' OR uploader_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can upload"
  ON public.library_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Owner or admin updates"
  ON public.library_items FOR UPDATE TO authenticated
  USING (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = uploader_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete library"
  ON public.library_items FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_library_items_updated_at
  BEFORE UPDATE ON public.library_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for the 'library' bucket (created via tool)
CREATE POLICY "Library files signed-in read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'library');

CREATE POLICY "Authenticated upload library files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'library' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins delete library files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'library' AND public.has_role(auth.uid(), 'admin'));
