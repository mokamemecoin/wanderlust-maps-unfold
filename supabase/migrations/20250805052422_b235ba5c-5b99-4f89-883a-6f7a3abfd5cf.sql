-- Add user_id column to travelers table
ALTER TABLE public.travelers 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies to work with user_id
DROP POLICY IF EXISTS "Users can view all travelers" ON public.travelers;
DROP POLICY IF EXISTS "Users can create travelers" ON public.travelers;
DROP POLICY IF EXISTS "Users can update their own travelers" ON public.travelers;
DROP POLICY IF EXISTS "Users can delete their own travelers" ON public.travelers;

-- Create new RLS policies
CREATE POLICY "Everyone can view all travelers" 
ON public.travelers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create travelers" 
ON public.travelers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own travelers" 
ON public.travelers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travelers" 
ON public.travelers 
FOR DELETE 
USING (auth.uid() = user_id);