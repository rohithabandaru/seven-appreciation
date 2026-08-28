import { promises as fs } from 'fs';
import path from 'path';
import { UPLOAD_CONFIG } from './config';
import { randomBytes } from 'crypto';

const BASE_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), UPLOAD_CONFIG.storageBasePath);

function generateStorageKey(category: string, userId: string, extension: string): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const randomId = randomBytes(16).toString('hex');
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 32);
  return `${category}/${year}/${month}/${safeUserId}_${randomId}.${extension}`;
}

export interface StoragePutResult {
  storageKey: string;
  filePath: string;
  publicUrl: string;
}

export async function storagePut(
  category: string,
  userId: string,
  extension: string,
  buffer: Buffer
): Promise<StoragePutResult> {
  const storageKey = generateStorageKey(category, userId, extension);
  const filePath = path.join(BASE_DIR, storageKey);
  const dir = path.dirname(filePath);

  await fs.mkdir(dir, { recursive: true, mode: 0o755 });
  await fs.writeFile(filePath, buffer, { mode: 0o644 });

  return {
    storageKey,
    filePath,
    publicUrl: `/uploads/${storageKey}`,
  };
}

export async function storageDelete(storageKey: string): Promise<boolean> {
  try {
    const filePath = path.join(BASE_DIR, storageKey);
    const resolved = path.resolve(filePath);
    const baseResolved = path.resolve(BASE_DIR);

    if (!resolved.startsWith(baseResolved)) {
      return false;
    }

    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function storageExists(storageKey: string): Promise<boolean> {
  try {
    const filePath = path.join(BASE_DIR, storageKey);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function storageStat(storageKey: string): Promise<{ size: number } | null> {
  try {
    const filePath = path.join(BASE_DIR, storageKey);
    const stat = await fs.stat(filePath);
    return { size: stat.size };
  } catch {
    return null;
  }
}

export async function cleanupOrphanedFiles(validKeys: Set<string>): Promise<number> {
  let cleaned = 0;

  async function walkDir(dir: string): Promise<void> {
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile()) {
        const relativePath = path.relative(BASE_DIR, fullPath);
        const normalizedKey = relativePath.replace(/\\/g, '/');
        if (!validKeys.has(normalizedKey)) {
          try {
            await fs.unlink(fullPath);
            cleaned++;
          } catch {
            // ignore cleanup errors
          }
        }
      }
    }
  }

  await walkDir(BASE_DIR);
  return cleaned;
}

export { generateStorageKey, BASE_DIR };
