"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import LessonService from "@/services/lesson.service";
import { Lesson } from "@/types/lesson";
import { isGoogleDriveUrl, convertGoogleDriveUrl } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Timeout for video loading
  useEffect(() => {
    if (loading && videoUrl) {
      const timeout = setTimeout(() => {
        console.warn("⏱️ Video yuklash vaqti o'tdi. URL:", videoUrl);
        // Timeout bo'lsa ham loading'ni o'chirish, chunki iframe yuklangan bo'lishi mumkin
        setLoading(false);
      }, 5000); // 5 soniya
      
      return () => clearTimeout(timeout);
    }
  }, [loading, videoUrl]);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let idStr = id as string;
        
        // URL encoded bo'lsa, decode qilish (bir necha marta)
        try {
          while (idStr !== decodeURIComponent(idStr)) {
            idStr = decodeURIComponent(idStr);
          }
        } catch (e) {
          // Decode qilishda xatolik bo'lsa, asl qiymatni ishlatish
        }
        
        console.log("🔍 Processing URL parameter:", idStr);
        
        // 1. Agar to'g'ridan-to'g'ri Google Drive URL bo'lsa (to'liq yoki qisman)
        if (idStr.includes('drive.google.com') || idStr.includes('/file/d/') || idStr.includes('google.com')) {
          console.log("🔗 Direct Google Drive URL detected");
          let url = idStr.trim();
          
          // Agar to'liq URL bo'lmasa, qo'shish
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
          }
          
          // Google Drive URL'ni preview formatiga o'tkazish
          if (isGoogleDriveUrl(url)) {
            if (!url.includes('/preview')) {
              url = convertGoogleDriveUrl(url);
              console.log("🔄 Converted to preview URL:", url);
            } else {
              console.log("✅ URL allaqachon preview formatida");
            }
          }
          
          console.log("🎬 Setting video URL directly (NO DATABASE QUERY):", url);
          setVideoUrl(url);
          // Iframe'ni darhol ko'rsatish uchun loading'ni tez o'chiramiz
          setTimeout(() => {
            setLoading(false);
          }, 1500);
          return;
        }
        
        // 2. Agar Google Drive file ID bo'lsa (faqat ID - 20+ belgi)
        if (idStr.match(/^[a-zA-Z0-9_-]{20,}$/)) {
          console.log("🔑 Google Drive File ID detected:", idStr);
          const previewUrl = `https://drive.google.com/file/d/${idStr}/preview`;
            console.log("🎬 Setting video URL from file ID:", previewUrl);
          setVideoUrl(previewUrl);
          // Iframe'ni darhol ko'rsatish uchun loading'ni tez o'chiramiz
          setTimeout(() => {
            setLoading(false);
          }, 1500);
          return;
        }
        
        // 3. Agar raqam bo'lsa, lesson ID sifatida qidirish (fallback)
        const idNum = parseInt(idStr);
        if (!isNaN(idNum) && idStr.length < 10) { // Faqat qisqa raqamlar lesson ID bo'lishi mumkin
          console.log("📚 Treating as lesson ID:", idNum);
          
          try {
            const fetchedLesson = await LessonService.findOne(idStr);
            console.log("✅ Fetched lesson:", fetchedLesson);
            
            if (!fetchedLesson) {
              console.error("❌ Lesson not found for ID:", idStr);
              setError("Dars topilmadi.");
              setLoading(false);
              return;
            }

            setLesson(fetchedLesson);
            
            // Video URL'ni olish va to'g'ri formatga o'tkazish
            if (!fetchedLesson.video_url || fetchedLesson.video_url.trim() === '') {
              console.error("❌ Video URL is empty for lesson:", fetchedLesson.id);
              setError("Bu dars uchun video URL mavjud emas.");
              setLoading(false);
              return;
            }
            
            let url = fetchedLesson.video_url.trim();
            console.log("🔗 Original video URL from lesson:", url);
            
            // Google Drive URL'ni preview formatiga o'tkazish
            if (isGoogleDriveUrl(url)) {
              if (!url.includes('/preview')) {
                url = convertGoogleDriveUrl(url);
                console.log("🔄 Converted video URL:", url);
              } else {
                console.log("✅ URL allaqachon preview formatida");
              }
            }
            
            console.log("🎬 Setting video URL from lesson:", url);
            setVideoUrl(url);
            // Iframe'ni darhol ko'rsatish uchun loading'ni tez o'chiramiz
            setTimeout(() => {
              setLoading(false);
            }, 1500);
            return;
          } catch (lessonErr: any) {
            console.error("❌ Lesson fetch error:", lessonErr);
            setError("Darsni yuklashda xatolik yuz berdi: " + (lessonErr?.message || "Noma'lum xatolik"));
            setLoading(false);
            return;
          }
        }
        
        // 4. Agar hech qanday formatga mos kelmasa
        console.error("❌ Invalid format:", idStr);
        setError("Noto'g'ri video URL. Google Drive URL yoki File ID kiriting.");
        setLoading(false);
      } catch (err: any) {
        console.error("❌ Video metadata error:", err);
        setError("Videoni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
        setLoading(false);
      }
    };

    fetchVideo();
  }, [user, userLoading, router, id]);

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Video yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-red-400">
        <div className="text-center max-w-md px-4">
          <p className="mb-4 text-lg">{error}</p>
          {lesson && (
            <p className="mb-4 text-sm text-gray-500">
              Dars: {lesson.title}
            </p>
          )}
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Videoni yangi oynada ochish
            </a>
          )}
          <button
            onClick={() => router.back()}
            className="mt-4 block mx-auto px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
        <div className="text-center">
          <p className="mb-4 text-lg">Video URL topilmadi.</p>
          {lesson && (
            <p className="mb-4 text-sm text-gray-500">
              Dars: {lesson.title}
            </p>
          )}
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // Google Drive video bo'lsa, iframe ko'rsatish
  if (isGoogleDriveUrl(videoUrl)) {
    console.log("🎬 Rendering Google Drive video with URL:", videoUrl);
    
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden shadow-2xl bg-black">
          {/* Iframe'ni darhol ko'rsatish */}
          <iframe
            ref={iframeRef}
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            frameBorder="0"
            allowFullScreen
            loading="eager"
            style={{ 
              width: '100%', 
              height: '100%',
              border: 'none',
              backgroundColor: 'black',
              zIndex: 10
            }}
            onLoad={() => {
              console.log("✅ Iframe loaded successfully with URL:", videoUrl);
              setLoading(false);
            }}
            onError={(e) => {
              console.error("❌ Iframe loading error:", e);
              setError("Videoni yuklashda xatolik yuz berdi.");
              setLoading(false);
            }}
          />
          {/* Loading indicator - faqat loading true bo'lsa ko'rsatish */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-95 z-30">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-white text-lg mb-2">Video yuklanmoqda...</p>
                <p className="text-white text-xs mb-4 opacity-75 break-all px-4 max-w-md mx-auto">{videoUrl}</p>
                <div className="flex gap-2 justify-center">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    Videoni yangi oynada ochish
                  </a>
                  <button
                    onClick={() => setLoading(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  >
                    Loading'ni yopish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  // Oddiy video bo'lsa, video tag ko'rsatish
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden shadow-2xl bg-black">
        <video
          src={videoUrl.startsWith('http') ? videoUrl : `${API_URL}/video-stream/stream/${videoUrl.split("/").pop()}`}
          className="w-full h-full object-cover"
          controls={true}
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          onLoadedData={() => {
            console.log("✅ Video loaded successfully");
            setLoading(false);
          }}
          onError={(e) => {
            console.error("❌ Video playback error:", e);
            setError("Videoni o'ynatishda xatolik yuz berdi.");
            setLoading(false);
          }}
        />
        {/* O'ng-bosishni bloklash */}
        <div
          className="absolute inset-0 pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </main>
  );
}
