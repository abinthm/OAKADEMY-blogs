/*
  # Initial schema setup for Voices of Oak

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `excerpt` (text)
      - `cover_image` (text)
      - `author_id` (uuid, references profiles)
      - `category` (text)
      - `published` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `post_hashtags`
      - `post_id` (uuid, references posts)
      - `hashtag` (text)
      - Primary key (post_id, hashtag)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  cover_image text,
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL,
  published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_hashtags table
CREATE TABLE IF NOT EXISTS post_hashtags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  hashtag text NOT NULL,
  PRIMARY KEY (post_id, hashtag)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Users can view their own unpublished posts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Post hashtags policies
CREATE POLICY "Post hashtags are viewable by everyone"
  ON post_hashtags FOR SELECT
  USING (true);

CREATE POLICY "Users can manage hashtags for own posts"
  ON post_hashtags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_hashtags.post_id
      AND posts.author_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();