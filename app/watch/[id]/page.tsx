"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import VideoService from "@/services/video.service";
import { Video } from "@/types/video";
import { isGoogleDriveUrl, extractGoogleDriveFileId } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  
  // Video player states (oddiy videolar uchun)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchVideo = async () => {
      try {
        const idStr = id as string;
        
        // Agar bu Google Drive FILE_ID ko'rinishida bo'lsa (uzun, alphanumeric + underscore/hyphen)
        if (idStr.match(/^[a-zA-Z0-9_-]{20,}$/)) {
          // Bu Google Drive FILE_ID bo'lishi mumkin
          // To'g'ridan-to'g'ri preview URL yaratish
          const previewUrl = `https://drive.google.com/file/d/${idStr}/preview`;
          
          // Database'da video topishga harakat qilish
          const allVideos = await VideoService.findAll();
          const foundVideo = allVideos.find(v => {
            if (!v.url) return false;
            const videoFileId = extractGoogleDriveFileId(v.url);
            return videoFileId === idStr;
          });
          
          if (foundVideo) {
            setVideo({
              ...foundVideo,
              url: previewUrl
            });
          } else {
            // Agar topilmasa, temporary video object
            setVideo({
              id: 0,
              title: 'Google Drive Video',
              url: previewUrl,
              description: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // Oddiy filename bo'lsa, database'dan qidirish
          const fetchedVideo = await VideoService.findByFilename(idStr);
          setVideo(fetchedVideo);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Video metadata error:", err);
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
        <p>{error}</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-gray-400">
        <p>Video topilmadi.</p>
      </div>
    );
  }

  // Google Drive video bo'lsa, iframe ko'rsatish
  if (isGoogleDriveUrl(video.url)) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden shadow-2xl bg-black">
          <iframe
            src={video.url}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen"
            frameBorder="0"
            allowFullScreen
            style={{ 
              width: '100%', 
              height: '100%',
              pointerEvents: 'auto'
            }}
          />
          {/* Overlay: share belgisini yashirish va bosilishini bloklash */}
          {/* O'ng yuqori burchakdagi share belgisini bloklash */}
          <div
            className="absolute"
            style={{
              top: '10px',
              right: '10px',
              width: '60px',
              height: '60px',
              background: 'transparent',
              pointerEvents: 'auto',
              zIndex: 1000,
              cursor: 'default'
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          />
          {/* Umumiy overlay: o'ng-bosish va boshqa bosilishlarni bloklash */}
          <div
            className="absolute inset-0"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              background: 'transparent',
              zIndex: 1
            }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </main>
    );
  }

  // Oddiy video bo'lsa, video tag ko'rsatish
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={videoRef}
          src={video.url.startsWith('http') ? video.url : `${API_URL}/video-stream/stream/${video.url.split("/").pop()}`}
          className="w-full h-full object-cover"
          controls={false}
          controlsList="nodownload"
          disablePictureInPicture
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        {/* Custom play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => {
              if (videoRef.current) {
                if (isPlaying) {
                  videoRef.current.pause();
                } else {
                  videoRef.current.play();
                }
              }
            }}
            className="bg-red-600 hover:bg-red-700 rounded-full w-16 h-16 flex items-center justify-center text-white"
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
        {/* O'ng-bosishni bloklash */}
        <div
          className="absolute inset-0 pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </main>
  );
}

