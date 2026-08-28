export { UPLOAD_CONFIG, getMaxFileSize, getUploadCategoryFromPurpose } from './config';
export type { UploadCategory } from './config';

export {
  validateFileUpload,
  getFileExtension,
  getContentTypeForExtension,
  sanitizeFilename,
  detectMimeType,
} from './validation';
export type { FileValidationResult } from './validation';

export { processImage, ImageProcessingError } from './processor';
export type { ProcessedImage } from './processor';

export {
  storagePut,
  storageDelete,
  storageExists,
  storageStat,
  cleanupOrphanedFiles,
} from './storage';
export type { StoragePutResult } from './storage';
