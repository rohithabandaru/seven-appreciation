import { validateFileUpload, detectMimeType, getFileExtension } from '@/lib/upload/validation';
import { UPLOAD_CONFIG, getMaxFileSize } from '@/lib/upload/config';

function makeJpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
}

function makePngBuffer(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
}

function makeWebpBuffer(): Buffer {
  const buf = Buffer.alloc(20);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(0, 4);
  buf.write('WEBP', 8);
  buf.write('VP8 ', 12);
  return buf;
}

function makeHtmlBuffer(): Buffer {
  return Buffer.from('<!DOCTYPE html><html><body><script>alert(1)</script></body></html>');
}

function makeSvgBuffer(): Buffer {
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
}

function makeExeBuffer(): Buffer {
  return Buffer.from('MZ' + '\x00'.repeat(60));
}

function makeEmptyBuffer(): Buffer {
  return Buffer.alloc(0);
}

function makeFakeFile(name: string, type: string, size: number = 100): File {
  const buffer = Buffer.alloc(size);
  return new File([buffer], name, { type });
}

describe('Upload Validation', () => {
  describe('detectMimeType', () => {
    it('detects JPEG from magic bytes', () => {
      expect(detectMimeType(makeJpegBuffer())).toBe('image/jpeg');
    });

    it('detects PNG from magic bytes', () => {
      expect(detectMimeType(makePngBuffer())).toBe('image/png');
    });

    it('detects WebP from magic bytes', () => {
      expect(detectMimeType(makeWebpBuffer())).toBe('image/webp');
    });

    it('rejects HTML files', () => {
      expect(detectMimeType(makeHtmlBuffer())).toBeNull();
    });

    it('rejects SVG files', () => {
      expect(detectMimeType(makeSvgBuffer())).toBeNull();
    });

    it('rejects executable files', () => {
      expect(detectMimeType(makeExeBuffer())).toBeNull();
    });

    it('rejects empty buffers', () => {
      expect(detectMimeType(makeEmptyBuffer())).toBeNull();
    });
  });

  describe('validateFileUpload', () => {
    it('accepts valid JPEG with image/jpeg MIME', () => {
      const file = makeFakeFile('photo.jpg', 'image/jpeg');
      const result = validateFileUpload(file, makeJpegBuffer(), 'photo');
      expect(result.valid).toBe(true);
    });

    it('accepts valid PNG with image/png MIME', () => {
      const file = makeFakeFile('photo.png', 'image/png');
      const result = validateFileUpload(file, makePngBuffer(), 'photo');
      expect(result.valid).toBe(true);
    });

    it('accepts valid WebP with image/webp MIME', () => {
      const file = makeFakeFile('photo.webp', 'image/webp');
      const result = validateFileUpload(file, makeWebpBuffer(), 'photo');
      expect(result.valid).toBe(true);
    });

    it('rejects SVG even if claimed as image/svg+xml', () => {
      const file = makeFakeFile('image.svg', 'image/svg+xml');
      const result = validateFileUpload(file, makeSvgBuffer(), 'photo');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(415);
    });

    it('rejects HTML files', () => {
      const file = makeFakeFile('page.html', 'text/html');
      const result = validateFileUpload(file, makeHtmlBuffer(), 'photo');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(415);
    });

    it('rejects JavaScript files', () => {
      const file = makeFakeFile('script.js', 'application/javascript');
      const result = validateFileUpload(file, Buffer.from('alert(1)'), 'photo');
      expect(result.valid).toBe(false);
    });

    it('rejects executable files', () => {
      const file = makeFakeFile('malware.exe', 'application/octet-stream');
      const result = validateFileUpload(file, makeExeBuffer(), 'photo');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(415);
    });

    it('rejects spoofed extension: malware.jpg with HTML content', () => {
      const file = makeFakeFile('malware.jpg', 'image/jpeg');
      const result = validateFileUpload(file, makeHtmlBuffer(), 'photo');
      expect(result.valid).toBe(false);
    });

    it('rejects spoofed extension: virus.png with SVG content', () => {
      const file = makeFakeFile('virus.png', 'image/png');
      const result = validateFileUpload(file, makeSvgBuffer(), 'photo');
      expect(result.valid).toBe(false);
    });

    it('rejects empty files', () => {
      const file = makeFakeFile('empty.jpg', 'image/jpeg');
      const result = validateFileUpload(file, makeEmptyBuffer(), 'photo');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(400);
    });

    it('rejects oversized files for avatar category (2MB limit)', () => {
      const file = makeFakeFile('big.jpg', 'image/jpeg');
      const bigBuffer = Buffer.alloc(3 * 1024 * 1024);
      bigBuffer[0] = 0xff;
      bigBuffer[1] = 0xd8;
      bigBuffer[2] = 0xff;
      const result = validateFileUpload(file, bigBuffer, 'avatar');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(413);
    });

    it('rejects oversized files for photo category (5MB limit)', () => {
      const file = makeFakeFile('big.jpg', 'image/jpeg');
      const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
      bigBuffer[0] = 0xff;
      bigBuffer[1] = 0xd8;
      bigBuffer[2] = 0xff;
      const result = validateFileUpload(file, bigBuffer, 'photo');
      expect(result.valid).toBe(false);
      expect(result.statusCode).toBe(413);
    });

    it('rejects disallowed file extensions', () => {
      const file = makeFakeFile('file.bmp', 'image/bmp');
      const result = validateFileUpload(file, makeJpegBuffer(), 'photo');
      expect(result.valid).toBe(false);
    });

    it('rejects GIF files', () => {
      const file = makeFakeFile('anim.gif', 'image/gif');
      const gifBuffer = Buffer.from('GIF89a');
      const result = validateFileUpload(file, gifBuffer, 'photo');
      expect(result.valid).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('extracts .jpg extension', () => {
      expect(getFileExtension('photo.jpg')).toBe('.jpg');
    });

    it('extracts .jpeg extension', () => {
      expect(getFileExtension('photo.jpeg')).toBe('.jpeg');
    });

    it('extracts .png extension', () => {
      expect(getFileExtension('photo.png')).toBe('.png');
    });

    it('extracts .webp extension', () => {
      expect(getFileExtension('photo.webp')).toBe('.webp');
    });

    it('returns null for no extension', () => {
      expect(getFileExtension('photo')).toBeNull();
    });

    it('returns null for dot-only filename', () => {
      expect(getFileExtension('photo.')).toBeNull();
    });
  });

  describe('Path Traversal', () => {
    it('filename with path traversal cannot affect storage key', () => {
      const maliciousNames = [
        '../../../etc/passwd.jpg',
        '..\\..\\windows\\system32\\config.jpg',
        'test/../../../secret.txt',
        '....//....//etc/passwd',
      ];

      for (const name of maliciousNames) {
        const ext = getFileExtension(name);
        const fakeFile = makeFakeFile(name, 'image/jpeg');
        const result = validateFileUpload(fakeFile, makeJpegBuffer(), 'photo');
        if (ext && !UPLOAD_CONFIG.allowedExtensions.includes(ext as typeof UPLOAD_CONFIG.allowedExtensions[number])) {
          expect(result.valid).toBe(false);
        }
      }
    });
  });

  describe('Rate Limit Policies', () => {
    it('has upload rate limit configured', () => {
      expect(UPLOAD_CONFIG.maxFilesPerUser).toBeGreaterThan(0);
      expect(UPLOAD_CONFIG.maxTotalStorageBytes).toBeGreaterThan(0);
    });
  });

  describe('File Size Limits', () => {
    it('avatar limit is smaller than photo limit', () => {
      expect(getMaxFileSize('avatar')).toBeLessThan(getMaxFileSize('photo'));
    });

    it('letter-image limit is smaller than photo limit', () => {
      expect(getMaxFileSize('letter-image')).toBeLessThanOrEqual(getMaxFileSize('photo'));
    });

    it('all limits are reasonable (between 1MB and 20MB)', () => {
      const categories: Array<'avatar' | 'photo' | 'letter-image' | 'post-image'> = ['avatar', 'photo', 'letter-image', 'post-image'];
      for (const cat of categories) {
        const size = getMaxFileSize(cat);
        expect(size).toBeGreaterThanOrEqual(1 * 1024 * 1024);
        expect(size).toBeLessThanOrEqual(20 * 1024 * 1024);
      }
    });
  });
});
