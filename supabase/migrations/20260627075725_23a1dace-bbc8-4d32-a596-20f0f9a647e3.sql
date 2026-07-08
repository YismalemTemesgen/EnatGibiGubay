CREATE TYPE public.feedback_category AS ENUM ('other_religion','tewahedo','about_gbi','suggestion');
CREATE TYPE public.feedback_status AS ENUM ('open','answered','closed');

CREATE TABLE public.feedback_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category public.feedback_category NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  contact text,
  status public.feedback_status NOT NULL DEFAULT 'open',
  admin_reply text,
  replied_by uuid REFERENCES auth.users ON DELETE SET NULL,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback_items TO authenticated;
GRANT ALL ON public.feedback_items TO service_role;

ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own feedback" ON public.feedback_items
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own feedback" ON public.feedback_items
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users edit own open feedback or admin" ON public.feedback_items
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id AND status = 'open') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK ((auth.uid() = user_id AND status = 'open') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete feedback" ON public.feedback_items
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_feedback_items_updated_at
  BEFORE UPDATE ON public.feedback_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();