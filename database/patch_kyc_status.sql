-- patch_kyc_status.sql
ALTER TABLE entrepreneur_profiles 
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) NOT NULL DEFAULT 'unverified' 
CHECK (kyc_status IN ('unverified', 'pending', 'approved', 'rejected'));
