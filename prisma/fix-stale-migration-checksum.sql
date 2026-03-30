-- Run once in Supabase SQL Editor if `prisma migrate dev` reports a checksum
-- mismatch for migration `20260329130911_` after the migration file was
-- replaced with a no-op (safe for shadow DB / fresh applies).
--
-- If Prisma still complains, compare its expected checksum to the value below
-- and update this UPDATE accordingly, or run: SELECT * FROM "_prisma_migrations"
-- WHERE migration_name = '20260329130911_';

UPDATE "_prisma_migrations"
SET
  checksum = '2e07d3547a70d5f29a7659e1aaf32e0cc871fd200c97401b4042c5f9448c96a2'
WHERE migration_name = '20260329130911_';
