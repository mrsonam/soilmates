-- Historical migration id kept so `_prisma_migrations` stays aligned with databases
-- that already ran the original script. The original SQL ran out of order (before
-- `care_logs` existed) and duplicated work from `20260330220000_care_logs_detailed`.
-- This file is intentionally a no-op for fresh applies.
SELECT 1;
