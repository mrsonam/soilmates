-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "cover_image_storage_path" TEXT,
ADD COLUMN     "cover_image_mime_type" TEXT;

-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "cover_image_storage_path" TEXT,
ADD COLUMN     "cover_image_mime_type" TEXT;
