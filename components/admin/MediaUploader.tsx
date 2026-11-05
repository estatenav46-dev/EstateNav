'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import type { ImageRef } from '@/lib/data/types';
import { getMediaRepo } from '@/lib/data/media';

const MAX_BYTES = 8 * 1024 * 1024;

// Reads the real dimensions and a 16px JPEG preview in the browser, before upload.
async function inspect(file: File) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = Math.max(1, Math.round((16 * bitmap.height) / bitmap.width));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const result = { width: bitmap.width, height: bitmap.height, blurDataURL: canvas.toDataURL('image/jpeg', 0.6) };
  bitmap.close();
  return result;
}

type Props = {
  label: string;
  images: ImageRef[];
  onChange: (images: ImageRef[]) => void;
  storagePath: string;
  coverId?: string;
  onSetCover?: (image: ImageRef) => void;
  errors?: string;
};

export function MediaUploader({ label, images, onChange, storagePath, coverId, onSetCover, errors }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<{ name: string; pct: number }[]>([]);
  const [problem, setProblem] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [over, setOver] = useState(false);

  const add = async (files: FileList | File[]) => {
    setProblem('');
    const list = Array.from(files).filter((f) => {
      if (!f.type.startsWith('image/')) {
        setProblem(`${f.name} is not an image.`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        setProblem(`${f.name} is larger than 8 MB.`);
        return false;
      }
      return true;
    });
    let next = [...images];
    for (const file of list) {
      setUploads((u) => [...u, { name: file.name, pct: 0 }]);
      try {
        const meta = await inspect(file);
        const ref = await getMediaRepo().upload(file, storagePath, { alt: '', order: next.length, ...meta }, ({ loaded, total }) =>
          setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, pct: Math.round((loaded / total) * 100) } : x))),
        );
        next = [...next, ref];
        onChange(next);
      } catch (error) {
        setProblem(error instanceof Error ? error.message : `Could not upload ${file.name}.`);
      } finally {
        setUploads((u) => u.filter((x) => x.name !== file.name));
      }
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next.map((img, i) => ({ ...img, order: i })));
  };

  const update = (index: number, patch: Partial<ImageRef>) => onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  const remove = (index: number) => {
    void getMediaRepo().remove(images[index]);
    onChange(images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i })));
  };

  return (
    <div>
      <p className="mb-2 font-medium">{label}</p>
      <div
        onDragOver={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (dragIndex !== null) return;
          e.preventDefault();
          setOver(false);
          void add(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center ${over ? 'border-accent-ink bg-accent-soft' : 'border-line-strong'}`}
      >
        <ImagePlus className="h-6 w-6 text-ink-muted" aria-hidden="true" />
        <p className="text-ink-muted">Drag images here, or</p>
        <button type="button" onClick={() => input.current?.click()} className="btn-secondary min-h-[40px] px-4">Choose files</button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && add(e.target.files)} />
        <p className="text-2xs text-ink-muted">JPG, PNG or WebP · up to 8 MB each · alt text required</p>
      </div>
      {uploads.map((u) => (
        <div key={u.name} className="mt-2" role="status">
          <p className="text-2xs text-ink-muted">Uploading {u.name} · {u.pct}%</p>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full origin-left bg-accent transition-transform duration-fast" style={{ transform: `scaleX(${u.pct / 100})` }} />
          </div>
        </div>
      ))}
      {(problem || errors) && <p className="mt-2 text-danger">{problem || errors}</p>}
      {images.length > 0 && (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {images.map((img, i) => (
            <li
              key={img.id}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                setDragIndex(null);
              }}
              className={`flex gap-3 rounded-xl border p-2 ${coverId === img.id ? 'border-accent-ink' : 'border-line'} ${dragIndex === i ? 'opacity-50' : ''}`}
            >
              <span className="relative h-20 w-24 shrink-0 cursor-grab overflow-hidden rounded-lg bg-surface-2">
                <Image src={img.url} alt="" fill sizes="96px" className="object-cover" unoptimized={img.url.startsWith('blob:')} />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="block text-2xs text-ink-muted">
                  Alt text
                  <input value={img.alt} onChange={(e) => update(i, { alt: e.target.value })} aria-invalid={!img.alt} className="field mt-0.5 min-h-[36px] px-2.5 text-sm" placeholder="Describe the photo" />
                </label>
                <div className="flex flex-wrap items-center gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2 disabled:opacity-30" aria-label="Move earlier">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-2 disabled:opacity-30" aria-label="Move later">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {onSetCover && (
                    <button type="button" onClick={() => onSetCover(img)} aria-pressed={coverId === img.id} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-2xs hover:bg-surface-2">
                      <Star className={`h-3.5 w-3.5 ${coverId === img.id ? 'fill-[rgb(var(--accent))] text-accent-ink' : ''}`} aria-hidden="true" /> {coverId === img.id ? 'Cover' : 'Set cover'}
                    </button>
                  )}
                  <button type="button" onClick={() => remove(i)} className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-danger hover:bg-surface-2" aria-label="Remove image">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
