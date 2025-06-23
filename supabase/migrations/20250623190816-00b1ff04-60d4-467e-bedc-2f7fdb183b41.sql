
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  scenario_type TEXT DEFAULT 'general',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  audio_url TEXT,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  preferred_language TEXT DEFAULT 'en',
  voice_speed DECIMAL DEFAULT 1.0,
  difficulty_level TEXT DEFAULT 'intermediate' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  practice_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (clerk_user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (clerk_user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Create RLS policies for messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub')
  ));

CREATE POLICY "Users can create their own messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (conversation_id IN (
    SELECT id FROM public.conversations 
    WHERE user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub')
  ));

-- Create RLS policies for user preferences
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can insert their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (user_id = (SELECT id FROM public.profiles WHERE clerk_user_id = auth.jwt() ->> 'sub'));

-- Create indexes for better performance
CREATE INDEX idx_profiles_clerk_user_id ON public.profiles(clerk_user_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
