import sharp from 'sharp';
import { UPLOAD_CONFIG, type UploadCategory } from './config';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'jpeg' | 'png' | 'webp';
  size: number;
}

export async function processImage(
  inputBuffer: Buffer,
  category: UploadCategory
): Promise<ProcessedImage> {
  const metadata = await sharp(inputBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new ImageProcessingError('Could not determine image dimensions.', 400);
  }

  const pixelCount = metadata.width * metadata.height;
  if (pixelCount > UPLOAD_CONFIG.maxPixelCount) {
    throw new ImageProcessingError(
      `Image has too many pixels (${pixelCount}). Maximum is ${UPLOAD_CONFIG.maxPixelCount}.`,
      413
    );
  }

  if (
    metadata.width > UPLOAD_CONFIG.maxImageDimensions.width ||
    metadata.height > UPLOAD_CONFIG.maxImageDimensions.height
  ) {
    throw new ImageProcessingError(
      `Image dimensions ${metadata.width}x${metadata.height} exceed maximum ${UPLOAD_CONFIG.maxImageDimensions.width}x${UPLOAD_CONFIG.maxImageDimensions.height}.`,
      413
    );
  }

  let pipeline = sharp(inputBuffer);

  pipeline = pipeline.rotate();

  if (category === 'avatar') {
    pipeline = pipeline.resize({
      width: UPLOAD_CONFIG.avatarProcessing.maxWidth,
      height: UPLOAD_CONFIG.avatarProcessing.maxHeight,
      fit: 'cover',
      withoutEnlargement: true,
    });
  } else {
    pipeline = pipeline.resize({
      width: UPLOAD_CONFIG.processing.maxWidth,
      height: UPLOAD_CONFIG.processing.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  // Metadata (EXIF, GPS, etc.) is stripped by default when processing with sharp

  const format = metadata.format === 'png' ? 'png' : 'webp';
  const quality = category === 'avatar'
    ? UPLOAD_CONFIG.avatarProcessing.quality
    : UPLOAD_CONFIG.processing.quality;

  if (format === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 6 });
  } else {
    pipeline = pipeline.webp({ quality });
  }

  const outputBuffer = await pipeline.toBuffer();
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    format,
    size: outputBuffer.length,
  };
}

export class ImageProcessingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ImageProcessingError';
    this.statusCode = statusCode;
  }
}
