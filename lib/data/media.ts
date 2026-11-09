import type { MediaRepo } from './repository';
import { mockMediaRepo } from './adapters/mock/media';
import { cloudinaryMediaRepo } from './adapters/cloudinary/media';

/** Browser-side media uploads for the admin panel. Uses Cloudinary direct client uploads. */
export function getMediaRepo(): MediaRepo {
  // If Cloudinary preset is configured, use Cloudinary
  if (process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
    return cloudinaryMediaRepo;
  }
  // Otherwise fall back to mock media repo for local development
  return mockMediaRepo;
}
