import type { MediaRepo, UploadProgress } from '../../repository';
import type { ImageRef } from '../../types';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dqcdzoi3';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'estatenav_uploads';

export const cloudinaryMediaRepo: MediaRepo = {
  async upload(file: File, path: string, meta, onProgress?: (progress: UploadProgress) => void): Promise<ImageRef> {
    const folder = `estatenav/${path}`;

    // Helper to perform the actual XHR upload to Cloudinary
    const uploadWithFormData = (formData: FormData): Promise<ImageRef> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

        xhr.open('POST', url, true);

        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              onProgress({ loaded: event.loaded, total: event.total });
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              const imageRef: ImageRef = {
                id: data.public_id,
                storagePath: data.public_id,
                url: data.secure_url,
                alt: meta.alt,
                width: data.width || meta.width,
                height: data.height || meta.height,
                blurDataURL: meta.blurDataURL,
                order: meta.order,
              };
              resolve(imageRef);
            } catch {
              reject(new Error('Failed to parse Cloudinary response.'));
            }
          } else {
            try {
              const errData = JSON.parse(xhr.responseText);
              reject(new Error(errData?.error?.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => {
          reject(new Error('Network error during image upload to Cloudinary.'));
        };

        xhr.send(formData);
      });
    };

    // First attempt: try signed upload via /api/cloudinary-sign if API key is present
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, timestamp }),
      });

      if (signRes.ok) {
        const { signature, apiKey } = await signRes.json();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp.toString());
        formData.append('signature', signature);
        formData.append('folder', folder);
        return await uploadWithFormData(formData);
      }
    } catch {
      // Fall through to unsigned preset upload
    }

    // Second attempt: unsigned preset upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    return uploadWithFormData(formData);
  },

  async remove(_image: ImageRef): Promise<void> {
    // Images are managed in Cloudinary
  },
};
