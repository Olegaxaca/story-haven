-- Add parent_id column for threaded replies
ALTER TABLE public.comments
ADD COLUMN parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;

-- Index for faster queries on parent_id
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);