import { UPLOAD_CONFIG, type UploadCategory, getMaxFileSize } from './config';

const MAGIC_BYTES: Record<string, Buffer[]> = {
  'image/jpeg': [
    Buffer.from([0xff, 0xd8, 0xff]),
    Buffer.from([0xff, 0xd8]),
  ],
  'image/png': [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  'image/webp': [
    Buffer.from('RIFF', 'ascii'),
  ],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
}

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length < 2) return null;

  for (const [mimeType, signatures] of Object.entries(MAGIC_BYTES)) {
    for (const sig of signatures) {
      if (mimeType === 'image/webp') {
        if (buffer.length >= 12 && buffer.subarray(0, 4).equals(sig) && buffer.subarray(8, 12).equals(Buffer.from('WEBP', 'ascii'))) {
          return mimeType;
        }
      } else if (buffer.subarray(0, sig.length).equals(sig)) {
        return mimeType;
      }
    }
  }

  return null;
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]+/, '')
    .slice(0, 100);
}

export function validateFileUpload(
  file: { name?: string; type?: string; size?: number },
  buffer: Buffer,
  category: UploadCategory
): FileValidationResult {
  const maxSize = getMaxFileSize(category);

  if (buffer.length > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`,
      statusCode: 413,
    };
  }

  if (buffer.length === 0) {
    return {
      valid: false,
      error: 'Empty file.',
      statusCode: 400,
    };
  }

  const detectedMime = detectMimeType(buffer);
  if (!detectedMime) {
    return {
      valid: false,
      error: 'File is not a valid image. Allowed formats: JPEG, PNG, WebP.',
      statusCode: 415,
    };
  }

  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(detectedMime as typeof UPLOAD_CONFIG.allowedMimeTypes[number])) {
    return {
      valid: false,
      error: `File type "${detectedMime}" is not allowed. Allowed formats: JPEG, PNG, WebP.`,
      statusCode: 415,
    };
  }

  const claimedMime = file.type?.toLowerCase();
  if (claimedMime && claimedMime !== detectedMime) {
    if (claimedMime === 'image/gif' || claimedMime === 'image/svg+xml' || claimedMime === 'text/html') {
      return {
        valid: false,
        error: 'File type not allowed. Only JPEG, PNG, and WebP images are accepted.',
        statusCode: 415,
      };
    }
  }

  const ext = getFileExtension(file.name);
  if (ext && !UPLOAD_CONFIG.allowedExtensions.includes(ext as typeof UPLOAD_CONFIG.allowedExtensions[number])) {
    return {
      valid: false,
      error: `File extension "${ext}" is not allowed. Allowed: .jpg, .jpeg, .png, .webp`,
      statusCode: 415,
    };
  }

  return { valid: true };
}

export function getFileExtension(filename?: string): string | null {
  if (!filename || typeof filename !== 'string') return null;
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return null;
  return filename.slice(lastDot).toLowerCase();
}

export function getContentTypeForExtension(ext: string): string {
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export { sanitizeFilename, detectMimeType };
