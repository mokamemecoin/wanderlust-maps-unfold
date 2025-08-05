-- Update RLS policies for travelers table to work with user authentication
DROP POLICY IF EXISTS "Anyone can add traveler locations" ON public.travelers;
DROP POLICY IF EXISTS "Anyone can delete traveler locations" ON public.travelers;
DROP POLICY IF EXISTS "Anyone can update traveler locations" ON public.travelers;
DROP POLICY IF EXISTS "Travelers are viewable by everyone" ON public.travelers;

-- Create new RLS policies
CREATE POLICY "Everyone can view all travelers" 
ON public.travelers 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create travelers" 
ON public.travelers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Users can update their own travelers" 
ON public.travelers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travelers" 
ON public.travelers 
FOR DELETE 
USING (auth.uid() = user_id);