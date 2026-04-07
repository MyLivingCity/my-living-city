-- Add profile-level visibility controls for public community/business profiles.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'ProfileVisibility'
  ) THEN
    CREATE TYPE "ProfileVisibility" AS ENUM (
      'PUBLIC',
      'COMMUNITY_MEMBERS',
      'CONTACTS_ONLY',
      'PRIVATE'
    );
  END IF;
END$$;

ALTER TABLE "public_community_business_profile"
ADD COLUMN IF NOT EXISTS "profile_visibility" "ProfileVisibility" NOT NULL DEFAULT 'PUBLIC';
