-- patch_kyc_rejection_reason.sql
ALTER TABLE entrepreneur_profiles 
ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;
