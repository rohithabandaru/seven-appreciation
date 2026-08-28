import { UPLOAD_CONFIG, getMaxFileSize, getUploadCategoryFromPurpose } from '@/lib/upload/config';
import { sanitizeFilename, getFileExtension, getContentTypeForExtension, detectMimeType } from '@/lib/upload/validation';
import { validateFileUpload } from '@/lib/upload/validation';

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

function makeFakeFile(name: string, type: string, size: number = 100): File {
  const buffer = Buffer.alloc(size);
  return new File([buffer], name, { type });
}

describe('Upload Config', () => {
  it('allows only JPEG, PNG, WebP MIME types', () => {
    expect(UPLOAD_CONFIG.allowedMimeTypes).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('allows only safe extensions', () => {
    expect(UPLOAD_CONFIG.allowedExtensions).toEqual(['.jpg', '.jpeg', '.png', '.webp']);
  });

  it('has reasonable max pixel count', () => {
    expect(UPLOAD_CONFIG.maxPixelCount).toBe(4096 * 4096);
  });

  it('has per-category file size limits', () => {
    expect(getMaxFileSize('avatar')).toBe(2 * 1024 * 1024);
    expect(getMaxFileSize('photo')).toBe(5 * 1024 * 1024);
    expect(getMaxFileSize('letter-image')).toBe(3 * 1024 * 1024);
    expect(getMaxFileSize('post-image')).toBe(5 * 1024 * 1024);
  });

  it('avatar limit is smaller than photo limit', () => {
    expect(getMaxFileSize('avatar')).toBeLessThan(getMaxFileSize('photo'));
  });

  it('maps purpose strings to categories correctly', () => {
    expect(getUploadCategoryFromPurpose('avatar')).toBe('avatar');
    expect(getUploadCategoryFromPurpose('photo')).toBe('photo');
    expect(getUploadCategoryFromPurpose('letter-image')).toBe('letter-image');
    expect(getUploadCategoryFromPurpose('post-image')).toBe('post-image');
    expect(getUploadCategoryFromPurpose('unknown')).toBe('photo');
  });
});

describe('Upload Validation - Magic Byte Detection', () => {
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
    const html = Buffer.from('<!DOCTYPE html><html><body></body></html>');
    expect(detectMimeType(html)).toBeNull();
  });

  it('rejects SVG files', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(detectMimeType(svg)).toBeNull();
  });

  it('rejects executable files', () => {
    const exe = Buffer.from('MZ' + '\x00'.repeat(60));
    expect(detectMimeType(exe)).toBeNull();
  });

  it('rejects empty buffers', () => {
    expect(detectMimeType(Buffer.alloc(0))).toBeNull();
  });

  it('rejects buffers smaller than 12 bytes', () => {
    expect(detectMimeType(Buffer.alloc(5))).toBeNull();
  });
});

describe('Upload Validation - File Validation', () => {
  it('accepts valid JPEG with matching MIME', () => {
    const file = makeFakeFile('photo.jpg', 'image/jpeg');
    const result = validateFileUpload(file, makeJpegBuffer(), 'photo');
    expect(result.valid).toBe(true);
  });

  it('accepts valid PNG with matching MIME', () => {
    const file = makeFakeFile('photo.png', 'image/png');
    const result = validateFileUpload(file, makePngBuffer(), 'photo');
    expect(result.valid).toBe(true);
  });

  it('accepts valid WebP with matching MIME', () => {
    const file = makeFakeFile('photo.webp', 'image/webp');
    const result = validateFileUpload(file, makeWebpBuffer(), 'photo');
    expect(result.valid).toBe(true);
  });

  it('rejects SVG even with image/svg+xml MIME', () => {
    const file = makeFakeFile('image.svg', 'image/svg+xml');
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    const result = validateFileUpload(file, svg, 'photo');
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(415);
  });

  it('rejects HTML files', () => {
    const file = makeFakeFile('page.html', 'text/html');
    const html = Buffer.from('<!DOCTYPE html><html><body></body></html>');
    const result = validateFileUpload(file, html, 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects JavaScript files', () => {
    const file = makeFakeFile('script.js', 'application/javascript');
    const result = validateFileUpload(file, Buffer.from('alert(1)'), 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects executable files', () => {
    const file = makeFakeFile('malware.exe', 'application/octet-stream');
    const exe = Buffer.from('MZ' + '\x00'.repeat(60));
    const result = validateFileUpload(file, exe, 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects spoofed extension: .jpg with HTML content', () => {
    const file = makeFakeFile('malware.jpg', 'image/jpeg');
    const html = Buffer.from('<!DOCTYPE html><html><body></body></html>');
    const result = validateFileUpload(file, html, 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects spoofed extension: .png with SVG content', () => {
    const file = makeFakeFile('virus.png', 'image/png');
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    const result = validateFileUpload(file, svg, 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects empty files', () => {
    const file = makeFakeFile('empty.jpg', 'image/jpeg');
    const result = validateFileUpload(file, Buffer.alloc(0), 'photo');
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(400);
  });

  it('rejects oversized avatar (2MB limit)', () => {
    const file = makeFakeFile('big.jpg', 'image/jpeg');
    const big = Buffer.alloc(3 * 1024 * 1024);
    big[0] = 0xff; big[1] = 0xd8; big[2] = 0xff;
    const result = validateFileUpload(file, big, 'avatar');
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(413);
  });

  it('rejects oversized photo (5MB limit)', () => {
    const file = makeFakeFile('big.jpg', 'image/jpeg');
    const big = Buffer.alloc(6 * 1024 * 1024);
    big[0] = 0xff; big[1] = 0xd8; big[2] = 0xff;
    const result = validateFileUpload(file, big, 'photo');
    expect(result.valid).toBe(false);
    expect(result.statusCode).toBe(413);
  });

  it('rejects disallowed file extension (BMP)', () => {
    const file = makeFakeFile('file.bmp', 'image/bmp');
    const result = validateFileUpload(file, makeJpegBuffer(), 'photo');
    expect(result.valid).toBe(false);
  });

  it('rejects GIF files', () => {
    const file = makeFakeFile('anim.gif', 'image/gif');
    const gif = Buffer.from('GIF89a');
    const result = validateFileUpload(file, gif, 'photo');
    expect(result.valid).toBe(false);
  });
});

describe('Upload Validation - Filename Utilities', () => {
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

  it('returns null for trailing dot', () => {
    expect(getFileExtension('photo.')).toBeNull();
  });

  it('returns lowercase extension', () => {
    expect(getFileExtension('PHOTO.JPG')).toBe('.jpg');
  });

  it('sanitizes dangerous filenames', () => {
    const safe = sanitizeFilename('../../../etc/passwd.jpg');
    expect(safe).not.toContain('..');
    expect(safe).not.toContain('/');
  });

  it('sanitizes filenames with special characters', () => {
    const safe = sanitizeFilename('my photo (1).jpg');
    expect(safe).not.toContain(' ');
    expect(safe).not.toContain('(');
    expect(safe).not.toContain(')');
  });

  it('maps extensions to content types', () => {
    expect(getContentTypeForExtension('.jpg')).toBe('image/jpeg');
    expect(getContentTypeForExtension('.jpeg')).toBe('image/jpeg');
    expect(getContentTypeForExtension('.png')).toBe('image/png');
    expect(getContentTypeForExtension('.webp')).toBe('image/webp');
    expect(getContentTypeForExtension('.gif')).toBe('application/octet-stream');
  });
});

describe('Upload Validation - Path Traversal', () => {
  it('malicious filenames cannot affect validation', () => {
    const malicious = [
      '../../../etc/passwd.jpg',
      '..\\..\\windows\\system32\\config.jpg',
      'test/../../../secret.txt',
    ];
    for (const name of malicious) {
      const ext = getFileExtension(name);
      const file = makeFakeFile(name, 'image/jpeg');
      const result = validateFileUpload(file, makeJpegBuffer(), 'photo');
      if (ext && !UPLOAD_CONFIG.allowedExtensions.includes(ext as any)) {
        expect(result.valid).toBe(false);
      }
    }
  });
});
