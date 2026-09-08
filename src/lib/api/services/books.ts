import { apiRequest, createQueryString } from '../client';

export interface BookCategoryRow { id: number; category_name: string; created_at: string; }
export interface BookRow {
  id: string | number; owner_user_id: number; category_id: number | null; title: string; author_name: string | null;
  book_price_minor: string | number; cover_url: string | null; cover_public_id: string | null; external_source: string | null;
  external_volume_id: string | null; status: number; description: string | null; canonical_key: string; owner_name: string; category_name: string | null;
  total_copy_count: number; available_copy_count: number; estimated_available_on: string | null;
}
export interface BookMetadataRow { source: string; id: string; title: string; authorName: string; coverUrl: string | null; }
export interface BookActivationInput {
  village: string; wardNo: number; fatherName: string; occupationType: 'student' | 'working' | 'business';
  institutionName?: string; educationLevel?: string; educationDetail?: string; professionDetail?: string;
}
export interface BookRequestRow {
  id: string | number; book_id: string | number; requester_user_id: number; requested_days: number; status: number;
  request_group_id?: string | null;
  due_on: string | null; title: string; cover_url: string | null; book_price_minor: string | number; owner_user_id: number;
  owner_name: string; requester_name: string; return_initiated_at?: string | null; return_received_at?: string | null;
  extensions?: Array<{ id: string | number; requestedDays: number; status: number }>;
}

export function getPublicBooks(params: { search?: string; categoryId?: number } = {}) {
  return apiRequest<{ rows: BookRow[] }>(`/books${createQueryString(params)}`, {}, { withAuth: false });
}
export function getPublicBook(bookId: string | number) { return apiRequest<{ row: BookRow }>(`/books/${bookId}`, {}, { withAuth: false }); }
export function getBookCategories() { return apiRequest<{ rows: BookCategoryRow[] }>('/books/categories', {}, { withAuth: false }); }
export function searchBookMetadata(q: string) { return apiRequest<{ rows: BookMetadataRow[] }>(`/books/search${createQueryString({ q })}`, {}, { withAuth: false }); }
export function getBookActivation() { return apiRequest<{ row: BookActivationInput | null }>('/books/me/activation'); }
export function activateBooks(input: BookActivationInput) { return apiRequest<{ row: BookActivationInput }>('/books/me/activation', { method: 'POST', body: JSON.stringify(input) }); }
export function createBookCategory(categoryName: string) { return apiRequest<{ row: BookCategoryRow }>('/books/categories', { method: 'POST', body: JSON.stringify({ categoryName }) }); }
export function createBook(input: Record<string, unknown>) { return apiRequest<{ row: BookRow }>('/books', { method: 'POST', body: JSON.stringify(input) }); }
export function requestBook(bookId: string | number, requestedDays: number) { return apiRequest<{ row: { copiesNotified?: number } }>(`/books/${bookId}/requests`, { method: 'POST', body: JSON.stringify({ requestedDays }) }); }
export function getMyBookRequests() { return apiRequest<{ rows: BookRequestRow[] }>('/books/me/requests'); }
export function ownerBookRequestAction(requestId: string | number, action: 'accept' | 'reject' | 'given' | 'return_received', ownerNote?: string) { return apiRequest<{ row: unknown }>(`/books/requests/${requestId}/owner`, { method: 'PATCH', body: JSON.stringify({ action, ownerNote }) }); }
export function confirmBookReceived(requestId: string | number, action: 'received' | 'returned') { return apiRequest<{ row: unknown }>(`/books/requests/${requestId}/received`, { method: 'PATCH', body: JSON.stringify({ action }) }); }
export function requestBookExtension(requestId: string | number, requestedDays: number) { return apiRequest<{ row: unknown }>(`/books/requests/${requestId}/extensions`, { method: 'POST', body: JSON.stringify({ requestedDays }) }); }
export function resolveBookExtension(extensionId: string | number, accepted: boolean) { return apiRequest<{ data: unknown }>(`/books/extensions/${extensionId}`, { method: 'PATCH', body: JSON.stringify({ accepted }) }); }

async function compressBookCover(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.72));
  bitmap.close();
  if (!blob) throw new Error('Image compression failed');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'book-cover'}.webp`, { type: 'image/webp' });
}

export async function uploadBookCover(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file');
  if (file.size > 12 * 1024 * 1024) throw new Error('Image must be smaller than 12 MB');
  const signature = await apiRequest<{ data: { uploadUrl: string; apiKey: string; signature: string; timestamp: number; folder: string; eager: string } }>('/books/upload-signature', { method: 'POST' });
  const compressed = await compressBookCover(file);
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
  return { coverUrl: data.secure_url as string, coverPublicId: data.public_id as string };
}
