CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view their messages" ON public.messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages as themselves" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Recipients can mark messages read" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = recipient_id) WITH CHECK (auth.uid() = recipient_id);
CREATE POLICY "Senders can delete their messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = sender_id);
CREATE INDEX idx_messages_pair ON public.messages (sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_messages_recipient ON public.messages (recipient_id, created_at DESC);

CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.post_comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO service_role;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment as themselves" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_post_comments_post ON public.post_comments (post_id, created_at);
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON public.post_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction text NOT NULL DEFAULT 'hungry',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, reaction)
);
GRANT SELECT ON public.post_reactions TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_reactions TO authenticated;
GRANT ALL ON public.post_reactions TO service_role;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are viewable by everyone" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can react as themselves" ON public.post_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own reactions" ON public.post_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;