export interface UploadResult {
  id: string;
  url: string;
  storageKey: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

export interface UploadError {
  error: string;
  statusCode: number;
}

export async function uploadFile(
  file: File,
  purpose: string,
  metadata?: Record<string, string>
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      formData.append(key, value);
    }
  }

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(data.error || `Upload failed with status ${response.status}`);
  }

  return response.json();
}

export async function deleteFile(id: string): Promise<boolean> {
  const response = await fetch(`/api/uploads/${id}`, {
    method: 'DELETE',
  });

  return response.ok;
}

export function validateFileClient(
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const filename = file.name ? file.name.toLowerCase() : '';
  const isImageByExt = /\.(jpe?g|png|webp)$/i.test(filename);
  const isImageByMime = file.type ? file.type.startsWith('image/') : false;

  if (!isImageByExt && !isImageByMime) {
    return { valid: false, error: 'Please select an image file (JPG, PNG, WebP).' };
  }

  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/pjpeg',
    'image/png',
    'image/webp',
    'image/x-png',
  ];

  if (file.type && !allowedTypes.includes(file.type.toLowerCase()) && !isImageByExt) {
    return { valid: false, error: 'Only JPG, PNG, and WebP images are allowed.' };
  }

  if (file.size > maxSizeBytes) {
    const maxMB = Math.round(maxSizeBytes / 1024 / 1024);
    return { valid: false, error: `File too large. Maximum size is ${maxMB}MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'Empty file.' };
  }

  return { valid: true };
}
