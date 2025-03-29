
-- Create a storage bucket for NFT images if it doesn't already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('nft-images', 'NFT Images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access for the bucket
INSERT INTO storage.policies (name, definition, bucket_id, policy)
VALUES (
  'Public Access to NFT Images',
  '(storage.foldername(name))[1] = ''public''',
  'nft-images',
  'SELECT'
)
ON CONFLICT (name, bucket_id) DO NOTHING;
