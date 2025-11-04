import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Google Drive linkini preview formatiga o'tkazadi
 * @param url - Google Drive file URL
 * @returns Preview URL yoki asl URL
 */
export function convertGoogleDriveUrl(url: string): string {
  if (!url) return url;
  
  // Google Drive file ID ni ajratib olish
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // Preview URL formatiga o'tkazish
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  // Agar allaqachon preview formatida bo'lsa
  if (url.includes('/preview')) {
    return url;
  }
  
  // Agar boshqa format bo'lsa, asl URL ni qaytaradi
  return url;
}

/**
 * URL Google Drive linkini aniqlaydi
 * @param url - URL
 * @returns true agar Google Drive linki bo'lsa
 */
export function isGoogleDriveUrl(url: string): boolean {
  return url.includes('drive.google.com/file/d/');
}

/**
 * Google Drive URL'dan file ID ni ajratib oladi
 * @param url - Google Drive URL
 * @returns File ID yoki null
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
