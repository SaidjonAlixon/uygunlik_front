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
  if (!url || typeof url !== 'string') return url;
  
  // URL ni trim qilish
  url = url.trim();
  
  // Google Drive file ID ni ajratib olish
  // Turli formatlarni qo'llab-quvvatlash:
  // - /file/d/FILE_ID/view
  // - /file/d/FILE_ID/view?usp=drive_link
  // - /file/d/FILE_ID/preview
  // - /file/d/FILE_ID/edit
  // - /file/d/FILE_ID?usp=drive_link
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    // Preview URL formatiga o'tkazish (video o'ynatish uchun)
    // Google Drive preview URL - bu iframe orqali video o'ynatish uchun ishlatiladi
    // Ehtimol muammo shundaki, preview URL ishlamayapti, shuning uchun view formatini ham sinab ko'ramiz
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    console.log(`Converting Google Drive URL: ${url} -> ${previewUrl}`);
    return previewUrl;
  }
  
  // Agar allaqachon preview formatida bo'lsa
  if (url.includes('/preview')) {
    return url;
  }
  
  // Agar boshqa format bo'lsa, asl URL ni qaytaradi
  console.warn(`Could not convert Google Drive URL: ${url}`);
  return url;
}

/**
 * Google Drive videoni to'g'ridan-to'g'ri o'ynatish uchun preview URL yaratadi
 * @param url - Google Drive file URL
 * @returns Preview URL yoki null
 */
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return null;
  
  // To'g'ridan-to'g'ri Google Drive preview URL (iframe uchun)
  // Bu format to'g'ridan-to'g'ri streaming uchun ishlaydi
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

/**
 * URL Google Drive linkini aniqlaydi
 * @param url - URL
 * @returns true agar Google Drive linki bo'lsa
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') && url.includes('/file/d/');
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
