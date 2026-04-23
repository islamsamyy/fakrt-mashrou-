-- Add video_url column to projects table
ALTER TABLE projects ADD COLUMN video_url text;

-- Add constraint to validate video URL format (YouTube or Vimeo)
ALTER TABLE projects
  ADD CONSTRAINT valid_video_url CHECK (
    video_url IS NULL OR
    (video_url LIKE '%youtube.com%' OR
     video_url LIKE '%youtu.be%' OR
     video_url LIKE '%vimeo.com%')
  );
