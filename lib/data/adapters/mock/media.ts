import type { MediaRepo } from '../../repository';

// Browser-only stand-in for Firebase Storage: files become object URLs and the upload
// progress is simulated so the admin uploader behaves as it will in production.
export const mockMediaRepo: MediaRepo = {
  async upload(file, path, meta, onProgress) {
    const total = file.size || 1;
    for (let step = 1; step <= 5; step += 1) {
      await new Promise((resolve) => setTimeout(resolve, 90));
      onProgress?.({ loaded: Math.round((total * step) / 5), total });
    }
    const id = `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    return {
      id,
      storagePath: `${path}/${id}.${ext}`,
      url: URL.createObjectURL(file),
      alt: meta.alt,
      width: meta.width,
      height: meta.height,
      blurDataURL: meta.blurDataURL,
      order: meta.order,
    };
  },
  async remove(image) {
    if (image.url.startsWith('blob:')) URL.revokeObjectURL(image.url);
  },
};
