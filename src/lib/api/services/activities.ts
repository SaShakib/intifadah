import { apiRequest } from '../client';

export interface ActivityRow {
  id: string | number;
  title: string;
  description: string;
  image_url: string | null;
  image_public_id: string | null;
  is_published: boolean;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
  created_by_name: string;
}

export interface ActivityInput {
  title: string;
  description: string;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  isPublished?: boolean;
}

export function getPublicActivities() {
  return apiRequest<{ rows: ActivityRow[] }>('/activities', {}, { withAuth: false });
}

export function getAdminActivities() {
  return apiRequest<{ rows: ActivityRow[] }>('/activities/manage');
}

export function createActivity(input: ActivityInput) {
  return apiRequest<{ row: ActivityRow }>('/activities', { method: 'POST', body: JSON.stringify(input) });
}

export function updateActivity(activityId: string | number, input: ActivityInput) {
  return apiRequest<{ row: ActivityRow }>(`/activities/${activityId}`, { method: 'PATCH', body: JSON.stringify(input) });
}

async function compressActivityImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78));
  bitmap.close();
  if (!blob) throw new Error('Image compression failed');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'activity'}.webp`, { type: 'image/webp' });
}

export async function uploadActivityImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image must be smaller than 12 MB');
  const signature = await apiRequest<{ data: { uploadUrl: string; apiKey: string; signature: string; timestamp: number; folder: string; eager: string } }>('/activities/upload-signature', { method: 'POST' });
  const compressed = await compressActivityImage(file);
  const form = new FormData();
  form.set('file', compressed);
  form.set('api_key', signature.data.apiKey);
  form.set('timestamp', String(signature.data.timestamp));
  form.set('signature', signature.data.signature);
  form.set('folder', signature.data.folder);
  form.set('eager', signature.data.eager);
  const response = await fetch(signature.data.uploadUrl, { method: 'POST', body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
  return { imageUrl: data.secure_url as string, imagePublicId: data.public_id as string };
}