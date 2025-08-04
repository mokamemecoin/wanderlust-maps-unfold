-- Create a table for travelers' current locations
CREATE TABLE public.travelers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is live location sharing)
CREATE POLICY "Travelers are viewable by everyone" 
ON public.travelers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can add traveler locations" 
ON public.travelers 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update traveler locations" 
ON public.travelers 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete traveler locations" 
ON public.travelers 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_travelers_updated_at
BEFORE UPDATE ON public.travelers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();