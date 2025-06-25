/*
  # Database Schema Setup for ConvoCraft

  1. New Tables
    - `profiles` - User profile information linked to auth.users
    - `conversations` - Store conversation history and metadata
    - `feedback_sessions` - Store detailed feedback for conversations

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access control
    - Users can only access their own data

  3. Functions & Triggers
    - Auto-create profile on user signup
*/

-- Create profiles table for user data (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE public.profiles (
      id uuid not null references auth.users on delete cascade,
      email text,
      full_name text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now(),
      primary key (id)
    );
  END IF;
END $$;

-- Create conversations table to store conversation history (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    CREATE TABLE public.conversations (
      id uuid not null default gen_random_uuid() primary key,
      user_id uuid references auth.users not null,
      topic text not null,
      language text not null default 'en',
      messages jsonb not null default '[]'::jsonb,
      summary text,
      feedback text,
      created_at timestamp with time zone not null default now(),
      updated_at timestamp with time zone not null default now()
    );
  END IF;
END $$;

-- Create feedback table to store user feedback sessions (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feedback_sessions') THEN
    CREATE TABLE public.feedback_sessions (
      id uuid not null default gen_random_uuid() primary key,
      conversation_id uuid references public.conversations not null,
      user_id uuid references auth.users not null,
      feedback_text text not null,
      feedback_points jsonb not null default '[]'::jsonb,
      language text not null default 'en',
      created_at timestamp with time zone not null default now()
    );
  END IF;
END $$;

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Users can view their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);
  END IF;

  -- Users can update their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" 
      ON public.profiles 
      FOR UPDATE 
      USING (auth.uid() = id);
  END IF;

  -- Users can insert their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" 
      ON public.profiles 
      FOR INSERT 
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create RLS policies for conversations (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Users can view their own conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'Users can view their own conversations'
  ) THEN
    CREATE POLICY "Users can view their own conversations" 
      ON public.conversations 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'Users can insert their own conversations'
  ) THEN
    CREATE POLICY "Users can insert their own conversations" 
      ON public.conversations 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Users can update their own conversations
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'conversations' 
    AND policyname = 'Users can update their own conversations'
  ) THEN
    CREATE POLICY "Users can update their own conversations" 
      ON public.conversations 
      FOR UPDATE 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create RLS policies for feedback sessions (with IF NOT EXISTS equivalent)
DO $$
BEGIN
  -- Users can view their own feedback
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_sessions' 
    AND policyname = 'Users can view their own feedback'
  ) THEN
    CREATE POLICY "Users can view their own feedback" 
      ON public.feedback_sessions 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;

  -- Users can insert their own feedback
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_sessions' 
    AND policyname = 'Users can insert their own feedback'
  ) THEN
    CREATE POLICY "Users can insert their own feedback" 
      ON public.feedback_sessions 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create function to handle new user signup (CREATE OR REPLACE is safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup (DROP IF EXISTS first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();