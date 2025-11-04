"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    
    // Foydalanuvchi autentifikatsiya qilinganligini tekshirish
    if (!user) {
      router.push("/auth");
      return;
    }

    setLoading(false);
  }, [user, userLoading, router]);

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
    return null; // Router redirect qiladi
  }

  // Google Drive FILE_ID ni to'g'ri formatda olish
  const fileId = id as string;
  const src = `https://drive.google.com/file/d/${fileId}/preview`;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-5xl aspect-video relative rounded-xl overflow-hidden shadow-2xl bg-black">
        <iframe
          src={src}
          className="absolute inset-0 w-full h-full border-0"
          allow="autoplay; fullscreen"
          frameBorder="0"
          allowFullScreen
        />
        {/* O'ng-bosishni bloklash (yuklab olishni qiyinlashtiradi) */}
        <div
          className="absolute inset-0 pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </main>
  );
}

