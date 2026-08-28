export const UPLOAD_CONFIG = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ] as const,

  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,

  maxFileSizeBytes: 5 * 1024 * 1024,
  maxAvatarSizeBytes: 2 * 1024 * 1024,
  maxPhotoSizeBytes: 5 * 1024 * 1024,
  maxLetterImageSizeBytes: 3 * 1024 * 1024,
  maxPostImageSizeBytes: 5 * 1024 * 1024,

  maxImageDimensions: {
    width: 4096,
    height: 4096,
  },
  maxPixelCount: 4096 * 4096,

  processing: {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
    stripMetadata: true,
  },

  avatarProcessing: {
    maxWidth: 512,
    maxHeight: 512,
    quality: 85,
  },

  storageBasePath: 'public/uploads',

  maxFilesPerUser: 50,
  maxTotalStorageBytes: 100 * 1024 * 1024,
} as const;

export type UploadCategory = 'avatar' | 'photo' | 'letter-image' | 'post-image';

export function getMaxFileSize(category: UploadCategory): number {
  switch (category) {
    case 'avatar':
      return UPLOAD_CONFIG.maxAvatarSizeBytes;
    case 'photo':
      return UPLOAD_CONFIG.maxPhotoSizeBytes;
    case 'letter-image':
      return UPLOAD_CONFIG.maxLetterImageSizeBytes;
    case 'post-image':
      return UPLOAD_CONFIG.maxPostImageSizeBytes;
    default:
      return UPLOAD_CONFIG.maxFileSizeBytes;
  }
}

export function getUploadCategoryFromPurpose(purpose: string): UploadCategory {
  switch (purpose) {
    case 'avatar':
      return 'avatar';
    case 'photo':
      return 'photo';
    case 'letter-image':
      return 'letter-image';
    case 'post-image':
      return 'post-image';
    default:
      return 'photo';
  }
}
