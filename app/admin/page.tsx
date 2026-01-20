"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import { Role, User } from "@/types/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Users,
  CreditCard,
  BookOpen,
  Settings,
  Search,
  CheckCircle,
  X,
  Edit,
  Trash2,
  PlusCircle,
  Upload,
  Loader2,
  LogOut,
  Moon,
  Sun,
  PlayCircle,
  Eye,
} from "lucide-react";
import { useTheme } from "next-themes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CourseService, {
  CreateCourseDto,
  UpdateCourseDto,
} from "@/services/course.service";
import VideoService, {
  CreateVideoDto,
} from "@/services/video.service";
import UserService from "@/services/user.service";
import { Course } from "@/types/course";
import { Video } from "@/types/video";
import { VideoCombobox } from "@/components/ui/video-combobox";
import { CourseCombobox } from "@/components/ui/course-combobox";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { convertGoogleDriveUrl, isGoogleDriveUrl, extractGoogleDriveFileId } from "@/lib/utils";
import TariffService from "@/services/tariff.service";
import LessonService from "@/services/lesson.service";
import { Tariff } from "@/types/tariff";
import { Lesson } from "@/types/lesson";

export default function AdminPage() {
  const { user, clearUser } = useUserStore();
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const handleLogout = () => {
    // Clear token
    localStorage.removeItem('auth_token');
    // Redirect to home
    window.location.href = '/';
  };

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isVideoUploadFormOpen, setIsVideoUploadFormOpen] = useState(false);
  const [isVideoEditFormOpen, setIsVideoEditFormOpen] = useState(false);
  const [isUserCoursesFormOpen, setIsUserCoursesFormOpen] = useState(false);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [isLessonsViewOpen, setIsLessonsViewOpen] = useState(false);
  const [isTariffFormOpen, setIsTariffFormOpen] = useState(false);
  const [isCreatingTariff, setIsCreatingTariff] = useState(false);
  const [isEditingTariff, setIsEditingTariff] = useState(false);

  // Tariff create form states
  const [tariffName, setTariffName] = useState("");
  const [tariffDescription, setTariffDescription] = useState("");
  const [tariffPrice, setTariffPrice] = useState<number>(0);

  const [videosToAddToForm, setVideosToAddToForm] = useState<string[]>([]);

  const [currentVideoFile, setCurrentVideoFile] = useState<File | null>(null);

  // Form states for Video
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  // Form states for Course
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [courseCategory, setCourseCategory] = useState<string[]>([]);
  const [courseVideos, setCourseVideos] = useState<string[]>([]);
  
  // New video URL states for direct Google Drive link
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoDescription, setNewVideoDescription] = useState("");

  // Lesson form states
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonOrderNumber, setLessonOrderNumber] = useState<number>(1);
  const [lessonAdditionalResources, setLessonAdditionalResources] = useState<File[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  // User management states
  const [usersSearchTerm, setUsersSearchTerm] = useState("");
  const debouncedUsersSearchTerm = useDebounce(usersSearchTerm, 500);
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [userTariffId, setUserTariffId] = useState<number | null>(null);
  const [userTariffLessons, setUserTariffLessons] = useState<Lesson[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user === undefined) {
      setLoading(true);
      return;
    }
    if (user === null) {
      router.push("/auth");
      return;
    }
    if (user?.role !== Role.ADMIN) {
      router.push("/dashboard");
      return;
    }
    Promise.all([fetchCourses(), fetchVideos(), fetchTariffs()]).finally(() =>
      setLoading(false)
    );
  }, [user, router]);

  // Redirect non-admin users to home
  useEffect(() => {
    if (user && user.role !== Role.ADMIN) {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user?.role === Role.ADMIN) {
      console.log("Admin user detected, fetching users...");
      fetchUsers();
    }
  }, [user, usersPage, debouncedUsersSearchTerm]);

  const fetchCourses = async () => {
    try {
      const fetchedCourses = await CourseService.findAll();
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Kurslarni yuklashda xato:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const fetchedVideos = await VideoService.findAll();
      setVideos(fetchedVideos);
    } catch (error) {
      console.error("Videolarni yuklashda xato:", error);
    }
  };

  const fetchTariffs = async () => {
    try {
      const fetchedTariffs = await TariffService.findAll();
      console.log("Fetched tariffs:", fetchedTariffs);
      setTariffs(fetchedTariffs || []);
    } catch (error: any) {
      console.error("Tariflarni yuklashda xato:", error);
      toast({
        title: "Xatolik",
        description: error?.response?.data?.error || error?.message || "Tariflarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
      setTariffs([]);
    }
  };

  const fetchLessons = async (tariffId: number) => {
    try {
      const fetchedLessons = await LessonService.findAllByTariff(String(tariffId));
      setLessons(fetchedLessons);
    } catch (error) {
      console.error("Darslarni yuklashda xato:", error);
    }
  };

  const handleCreateTariff = async () => {
    if (!tariffName || tariffPrice <= 0) {
      toast({
        title: "Xatolik",
        description: "Tarif nomi va narxi kiritilishi kerak",
        variant: "destructive",
      });
      return;
    }
    try {
      if (isCreatingTariff) return;
      setIsCreatingTariff(true);
      await TariffService.create({
        name: tariffName,
        description: tariffDescription,
        price: tariffPrice,
      });
      await fetchTariffs();
      setTariffName("");
      setTariffDescription("");
      setTariffPrice(0);
      setIsTariffFormOpen(false);
      toast({ title: "Muvaffaqiyatli!", description: "Tarif yaratildi" });
    } catch (error) {
      console.error("Tarif yaratishda xato:", error);
      toast({ title: "Xatolik", description: "Tarif yaratilmadi", variant: "destructive" });
    } finally {
      setIsCreatingTariff(false);
    }
  };

  const handleSaveTariff = async () => {
    if (isEditingTariff) {
      await handleUpdateTariff();
    } else {
      await handleCreateTariff();
    }
  };

  const handleEditTariffClick = (tariff: Tariff) => {
    setSelectedTariff(tariff);
    setTariffName(tariff.name);
    setTariffDescription(tariff.description || "");
    setTariffPrice(tariff.price);
    setIsEditingTariff(true);
    setIsTariffFormOpen(true);
  };

  const handleUpdateTariff = async () => {
    if (!selectedTariff || !tariffName || tariffPrice <= 0) {
      toast({
        title: "Xatolik",
        description: "Tarif nomi va narxi kiritilishi kerak",
        variant: "destructive",
      });
      return;
    }
    try {
      if (isCreatingTariff) return;
      setIsCreatingTariff(true);
      await TariffService.update(String(selectedTariff.id), {
        name: tariffName,
        description: tariffDescription,
        price: tariffPrice,
      });
      await fetchTariffs();
      setTariffName("");
      setTariffDescription("");
      setTariffPrice(0);
      setSelectedTariff(null);
      setIsEditingTariff(false);
      setIsTariffFormOpen(false);
      toast({ title: "Muvaffaqiyatli!", description: "Tarif yangilandi" });
    } catch (error) {
      console.error("Tarifni yangilashda xato:", error);
      toast({ title: "Xatolik", description: "Tarif yangilanmadi", variant: "destructive" });
    } finally {
      setIsCreatingTariff(false);
    }
  };

  const handleDeleteTariff = async (id: number) => {
    if (window.confirm("Haqiqatan ham bu tarifni o'chirmoqchimisiz? Barcha darslar ham o'chib ketadi.")) {
      try {
        await TariffService.remove(String(id));
        await fetchTariffs();
        toast({ title: "Muvaffaqiyatli!", description: "Tarif o'chirildi" });
      } catch (error: any) {
        console.error("Tarifni o'chirishda xato:", error);
        toast({
          title: "Xatolik",
          description: error?.response?.data?.error || "Tarifni o'chirib bo'lmadi",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddLesson = async () => {
    if (!selectedTariff) {
      toast({
        title: "Xatolik",
        description: "Tarif tanlanmagan",
        variant: "destructive",
      });
      return;
    }
    if (!lessonTitle || !lessonDescription) {
      toast({
        title: "Xatolik",
        description: "Sarlavha va tavsif kiritilishi kerak",
        variant: "destructive",
      });
      return;
    }
    try {
      await LessonService.create(String(selectedTariff.id), {
        title: lessonTitle,
        description: lessonDescription,
        video_url: lessonVideoUrl ? (isGoogleDriveUrl(lessonVideoUrl) ? convertGoogleDriveUrl(lessonVideoUrl) : lessonVideoUrl) : undefined,
        order_number: lessonOrderNumber || 1,
        additional_resources: lessonAdditionalResources.length > 0 ? lessonAdditionalResources.map(f => f.name) : undefined,
      });
      await fetchLessons(selectedTariff.id);
      setLessonTitle("");
      setLessonDescription("");
      setLessonVideoUrl("");
      setLessonOrderNumber(1);
      setLessonAdditionalResources([]);
      setIsLessonFormOpen(false);
      toast({ title: "Muvaffaqiyatli!", description: "Dars qo'shildi" });
    } catch (error: any) {
      console.error("Dars qo'shishda xato:", error);
      toast({
        title: "Xatolik",
        description: error?.response?.data?.error || "Dars qo'shilmadi",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      console.log("Fetching users...", { usersPage, debouncedUsersSearchTerm });
      const { data, total } = await UserService.findAll(
        usersPage,
        10,
        debouncedUsersSearchTerm
      );
      console.log("Users fetched:", { data, total });
      setUsers(data);
      setUsersTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error("Foydalanuvchilarni yuklashda xato:", error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    const courseData = {
      title: courseTitle,
      description: courseDescription,
      price: coursePrice,
      category: courseCategory,
      videos: courseVideos,
    };

    try {
      if (selectedCourse) {
        await CourseService.update(String(selectedCourse.id), courseData);
        toast({
          title: "Muvaffaqiyatli!",
          description: "Kurs muvaffaqiyatli yangilandi.",
        });
      } else {
        await CourseService.create(courseData);
        toast({
          title: "Muvaffaqiyatli!",
          description: "Kurs muvaffaqiyatli yaratildi.",
        });
      }
      fetchCourses();
      setIsCourseFormOpen(false);
      resetCourseForm();
    } catch (error) {
      console.error("Kursni saqlashda xato:", error);
      toast({
        title: "Xatolik!",
        description: "Kursni saqlashda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (window.confirm("Haqiqatan ham bu kursni o'chirmoqchimisiz?")) {
      try {
        await CourseService.remove(id);
        fetchCourses();
      } catch (error) {
        console.error("Kursni o'chirishda xato:", error);
      }
    }
  };

  const handleOpenCourseForm = (course: Course | null) => {
    if (course) {
      setSelectedCourse(course);
      setCourseTitle(course.title);
      setCourseDescription(course.description || "");
      setCoursePrice(course.price);
      setCourseCategory(course.category || []);
      setCourseVideos(
        course.videos.map((v) => (typeof v === "string" ? v : String(v.id)))
      );
    } else {
      resetCourseForm();
    }
    setIsCourseFormOpen(true);
  };

  const resetCourseForm = () => {
    setSelectedCourse(null);
    setCourseTitle("");
    setCourseDescription("");
    setCoursePrice(0);
    setCourseCategory([]);
    setCourseVideos([]);
    setVideosToAddToForm([]);
    setNewVideoTitle("");
    setNewVideoUrl("");
    setNewVideoDescription("");
  };

  // Google Drive video havolasini qo'shish
  const handleAddVideoFromUrl = async () => {
    if (!newVideoUrl || !newVideoTitle) {
      toast({
        title: "Xatolik",
        description: "Video sarlavha va havola kiritilishi kerak",
        variant: "destructive",
      });
      return;
    }

    // Google Drive linkini preview formatiga o'tkazish
    const previewUrl = convertGoogleDriveUrl(newVideoUrl);
    
    if (!isGoogleDriveUrl(newVideoUrl)) {
      toast({
        title: "Xatolik",
        description: "Iltimos, to'g'ri Google Drive havolasini kiriting",
        variant: "destructive",
      });
      return;
    }

    try {
      // Video yaratish
      const videoData = {
        title: newVideoTitle,
        description: newVideoDescription || '',
        filename: `gdrive_${Date.now()}`,
        url: previewUrl,
      };

      const createdVideo = await VideoService.create(null, videoData);
      
      // Kursga video qo'shish
      setCourseVideos((prev) => [...prev, String(createdVideo.id)]);
      
      // Formani tozalash
      setNewVideoTitle("");
      setNewVideoUrl("");
      setNewVideoDescription("");
      
      // Video ro'yxatini yangilash
      await fetchVideos();
      
      toast({
        title: "Muvaffaqiyatli!",
        description: "Video qo'shildi",
      });
    } catch (error) {
      console.error("Video qo'shishda xato:", error);
      toast({
        title: "Xatolik",
        description: "Video qo'shishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };

  const handleRemoveVideoFromForm = (videoId: string) => {
    setCourseVideos((prev) => prev.filter((id) => id !== videoId));
  };

  const handleAddVideosToForm = () => {
    setCourseVideos((prev) => [...new Set([...prev, ...videosToAddToForm])]);
    setVideosToAddToForm([]);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleVideoUpload = async () => {
    if (!currentVideoFile || !videoTitle) {
      alert("Iltimos, video fayli va sarlavhasini kiriting.");
      return;
    }

    // Fayl hajmini tekshirish (5MB limit - Vercel uchun)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (currentVideoFile.size > maxSize) {
      alert("Fayl juda katta. Maksimal hajm: 5MB. Iltimos, kichikroq video yuklang.");
      return;
    }

    setIsUploading(true);
    try {
      const createVideoDto: CreateVideoDto = {
        title: videoTitle,
        description: videoDescription,
      };
      await VideoService.create(currentVideoFile, createVideoDto);
      fetchVideos();
      alert("Video muvaffaqiyatli yuklandi!");
      setIsVideoUploadFormOpen(false);
      setCurrentVideoFile(null);
      setVideoTitle("");
      setVideoDescription("");
    } catch (error) {
      console.error("Videoni yuklashda xato:", error);
      alert("Videoni yuklashda xato yuz berdi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setVideoTitle(video.title);
    setVideoDescription(video.description || "");
    setIsVideoEditFormOpen(true);
  };

  const handleDeleteVideo = async (id: string) => {
    if (
      window.confirm("Siz rostdan ham video ma'lumotlarini o'chirmoqchimisiz?")
    ) {
      try {
        await VideoService.remove(id);
        fetchVideos();
      } catch (error) {
        console.error("Videoni o'chirishda xato:", error);
      }
    }
  };

  const [coursesToAddToUser, setCoursesToAddToUser] = useState<string[]>([]);

  const handleEditUserCoursesClick = async (user: User) => {
    setSelectedUser(user);
    const currentUserCourseIds = user?.courses?.map(course => String(course.id)) || [];
    setUserCourses(currentUserCourseIds);
    setUserTariffId(user?.tariff_id || null);
    
    // Load tariff lessons if tariff is selected
    if (user?.tariff_id) {
      try {
        const lessons = await LessonService.findAllByTariff(String(user.tariff_id));
        setUserTariffLessons(lessons);
      } catch (error) {
        console.error("Darslarni yuklashda xato:", error);
        setUserTariffLessons([]);
      }
    } else {
      setUserTariffLessons([]);
    }
    
    setIsUserCoursesFormOpen(true);
  };
  
  const handleUserTariffChange = async (tariffId: number | null) => {
    setUserTariffId(tariffId);
    if (tariffId) {
      try {
        const lessons = await LessonService.findAllByTariff(String(tariffId));
        setUserTariffLessons(lessons);
      } catch (error) {
        console.error("Darslarni yuklashda xato:", error);
        setUserTariffLessons([]);
      }
    } else {
      setUserTariffLessons([]);
    }
  };

  const handleUpdateUserCourses = async () => {
    if (!selectedUser) return;
    try {
      await UserService.updateUserCourses(String(selectedUser?.id), userCourses);
      if (userTariffId !== null) {
        await UserService.updateUserTariff(String(selectedUser?.id), userTariffId);
      }
      toast({
        title: "Muvaffaqiyatli!",
        description: `${selectedUser?.first_name}ning kurslari va tarifi muvaffaqiyatli yangilandi.`,
      });
      setIsUserCoursesFormOpen(false);
      setSelectedUser(null);
      setUserCourses([]);
      setUserTariffId(null);
      setUserTariffLessons([]);
      fetchUsers();
    } catch (error) {
      console.error("Foydalanuvchi kurslarini yangilashda xato:", error);
      toast({
        title: "Xatolik!",
        description: "Foydalanuvchi kurslarini yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: boolean) => {
    try {
      await UserService.updateUserStatus(userId, status);
      toast({
        title: "Muvaffaqiyatli!",
        description: `Foydalanuvchi statusi ${status ? 'faol' : 'nofaol'} qilindi.`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Foydalanuvchi statusini yangilashda xato:", error);
      toast({
        title: "Xatolik!",
        description: "Foydalanuvchi statusini yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await UserService.updateUserRole(userId, newRole);
      toast({
        title: "Muvaffaqiyatli!",
        description: `Foydalanuvchi roli ${newRole === 'admin' ? 'Admin' : 'User'} ga o'zgartirildi.`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Foydalanuvchi rolini yangilashda xato:", error);
      toast({
        title: "Xatolik!",
        description: "Foydalanuvchi rolini yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === true).length,
    pendingPayments: 0,
    totalRevenue: "0 so'm",
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 relative overflow-hidden">
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Admin Panel
                </h1>
              </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white hover:text-gray-900 dark:hover:bg-gray-700"
              title={mounted && theme === 'dark' ? 'Yorug\' rejim' : 'Tungi rejim'}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Badge variant="secondary" className="bg-blue-100 dark:bg-gray-800 dark:border-gray-700 text-blue-800 dark:text-white">
              Administrator
            </Badge>
            <Button variant="outline" size="sm" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              <Settings className="h-4 w-4 mr-2" />
              Sozlamalar
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 dark:bg-gray-800 dark:border-red-600 dark:text-red-400 dark:hover:bg-gray-700 hover:bg-red-50 dark:hover:border-red-500">
              <LogOut className="h-4 w-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Foydalanuvchilar, to'lovlar va kurslarni boshqaring
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Faol foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.activeUsers}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Kutilayotgan to'lovlar
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.pendingPayments}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Jami daromad</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tariffs">
          <TabsList className="mb-6 bg-white dark:bg-gray-800">
            <TabsTrigger value="tariffs" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Darslik</TabsTrigger>
            <TabsTrigger value="payments" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">To'lovlar</TabsTrigger>
            <TabsTrigger value="users" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="settings" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">Sozlamalar</TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="dark:text-white">Darslik</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      Tariflar va ularning ichidagi darslarni boshqaring
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsTariffFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Yangi tarif qo'shish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 dark:text-blue-400" />
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Tariflar yuklanmoqda...</p>
                  </div>
                ) : tariffs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Hozircha tariflar mavjud emas</p>
                    <Button
                      onClick={() => setIsTariffFormOpen(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Birinchi tarifni qo'shish
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-4 gap-6">
                    {tariffs.map((tariff) => (
                    <Card key={tariff.id} className="relative dark:bg-gray-800 dark:border-gray-700 shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl dark:text-white">{tariff.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 dark:text-gray-300 dark:hover:bg-gray-700"
                              onClick={() => handleEditTariffClick(tariff)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteTariff(tariff.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="mt-2 dark:text-gray-400">
                          {tariff.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {tariff.price.toLocaleString()} so'm
                          </p>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-sm dark:border-gray-600 dark:text-gray-300">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {tariff.lessons_count || 0} ta dars
                          </Badge>
                        </div>
                        <Button
                          onClick={async () => {
                            setSelectedTariff(tariff);
                            await fetchLessons(tariff.id);
                            setIsLessonsViewOpen(true);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Darslarni boshqarish
                        </Button>
                      </CardContent>
                    </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {/* ... Payments Tab ... */}
          </TabsContent>
          <TabsContent value="users">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Foydalanuvchilarni boshqarish</CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Foydalanuvchilarni qidiring, ko'ring va ularning kurslarini
                  boshqaring.
                </CardDescription>
                <div className="pt-4">
                  <Input
                    placeholder="Foydalanuvchilarni ism yoki email bo'yicha qidirish..."
                    value={usersSearchTerm}
                    onChange={(e) => setUsersSearchTerm(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="dark:text-gray-400">Foydalanuvchilar yuklanmoqda...</p>
                ) : users.length === 0 ? (
                  <p className="dark:text-gray-400">Foydalanuvchilar topilmadi.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="dark:text-gray-300">Ism</TableHead>
                        <TableHead className="dark:text-gray-300">Email</TableHead>
                        <TableHead className="dark:text-gray-300">Roli</TableHead>
                        <TableHead className="dark:text-gray-300">Status</TableHead>
                        <TableHead className="text-right dark:text-gray-300">Harakatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user?.id} className="dark:border-gray-700 dark:hover:bg-gray-700/50">
                          <TableCell className="font-medium dark:text-white">
                            {user?.first_name} {user?.last_name}
                          </TableCell>
                          <TableCell className="dark:text-white">{user?.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user?.role === Role.ADMIN
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={`${
                                user?.role === Role.ADMIN
                                  ? "bg-red-600 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600"
                                  : "bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-500 dark:text-white dark:border-yellow-500"
                              }`}
                            >
                              {user?.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={user?.status ? "default" : "outline"}
                                className={`${
                                  user?.status
                                    ? "bg-green-600 text-white border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600"
                                    : "bg-red-600 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600"
                                }`}
                              >
                                {user?.status ? "Faol" : "Nofaol"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`${user?.status ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"} dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white`}
                                onClick={() => handleUpdateUserStatus(String(user?.id), !user?.status)}
                              >
                                {user?.status ? "Nofaol qilish" : "Faol qilish"}
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUserCoursesClick(user)}
                                className="dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user?.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-blue-600 border-blue-200 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white`}
                                  onClick={() => handleUpdateUserRole(String(user?.id), 'admin')}
                                >
                                  Admin qilish
                                </Button>
                              )}
                              {user?.role === 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={`text-gray-600 border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white`}
                                  onClick={() => handleUpdateUserRole(String(user?.id), 'user')}
                                >
                                  User qilish
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                    disabled={usersPage === 1}
                    className="dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:disabled:opacity-50"
                  >
                    Oldingisi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage((p) => p + 1)}
                    disabled={usersPage === usersTotalPages}
                    className="dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white dark:disabled:opacity-50"
                  >
                    Keyingisi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Kurslar boshqaruvi</CardTitle>
                  <Button
                    onClick={() => handleOpenCourseForm(null)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Yangi kurs
                  </Button>
                </div>
                <CardDescription>
                  Kurs materiallarini va darslarni boshqaring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Kurslar yuklanmoqda...</p>
                ) : courses.length === 0 ? (
                  <p>Hozircha kurslar mavjud emas.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sarlavha</TableHead>
                        <TableHead>Narxi</TableHead>
                        <TableHead>Kategoriya</TableHead>
                        <TableHead>Darslar soni</TableHead>
                        <TableHead className="text-right">Harakatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {course.title}
                          </TableCell>
                          <TableCell>
                            {course.price.toLocaleString()} so'm
                          </TableCell>
                          <TableCell>{course.category.join(", ")}</TableCell>
                          <TableCell>{course.videos.length}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleOpenCourseForm(course)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteCourse(String(course.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Videolar boshqaruvi</CardTitle>
                  <Button
                    onClick={() => setIsVideoUploadFormOpen(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Yangi video yuklash
                  </Button>
                </div>
                <CardDescription>
                  Barcha yuklangan videolarni boshqaring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Videolar yuklanmoqda...</p>
                ) : videos.length === 0 ? (
                  <p>Hozircha videolar mavjud emas.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sarlavha</TableHead>
                        <TableHead>Tavsif</TableHead>
                        <TableHead className="text-right">Harakatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell className="font-medium">
                            <Link
                              href={video.url 
                                ? `/watch/${encodeURIComponent(video.url)}`
                                : `/watch/${video.filename || video.id || ''}`
                              }
                              className="hover:underline"
                              target="_blank"
                            >
                              {video.title}
                            </Link>
                          </TableCell>
                          <TableCell>{video.description}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => handleEditVideoClick(video)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteVideo(String(video.id))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            {/* ... Settings Tab ... */}
          </TabsContent>
        </Tabs>
      </div>

      {/* Unified Course Create/Edit Dialog */}
      <Dialog open={isCourseFormOpen} onOpenChange={setIsCourseFormOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {selectedCourse ? "Kursni tahrirlash" : "Yangi kurs yaratish"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedCourse
                ? "Kurs ma'lumotlarini va unga biriktirilgan videolarni boshqaring."
                : "Yangi kurs uchun ma'lumotlarni kiriting."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right dark:text-gray-300">
                  Sarlavha
                </Label>
                <Input
                  id="title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right dark:text-gray-300">
                  Tavsif
                </Label>
                <Textarea
                  id="description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right dark:text-gray-300">
                  Narxi
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(parseFloat(e.target.value))}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right dark:text-gray-300">
                  Kategoriya
                </Label>
                <Input
                  id="category"
                  value={courseCategory.join(", ")}
                  onChange={(e) =>
                    setCourseCategory(
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Masalan: Ayollar salomatligi, Gormonlar"
                />
              </div>
            </div>

            <Separator className="my-6 dark:bg-gray-700" />

            <div>
              <h3 className="text-lg font-medium mb-4 dark:text-white">Kurs Videolari</h3>
              <div className="rounded-md border mb-4 dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Sarlavha</TableHead>
                      <TableHead className="text-right dark:text-gray-300">Harakat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseVideos.length > 0 ? (
                      courseVideos.map((videoId) => {
                        const video = videos.find((v) => String(v.id) === videoId);
                        if (!video) return null;
                        return (
                          <TableRow key={videoId} className="dark:border-gray-700 dark:hover:bg-gray-700/50">
                            <TableCell className="font-medium dark:text-white">
                              <Link
                                href={video.url 
                                  ? `/watch/${encodeURIComponent(video.url)}`
                                  : `/watch/${video.filename || video.id || ''}`
                                }
                                className="hover:underline dark:text-blue-400"
                                target="_blank"
                              >
                                {video.title}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                                onClick={() =>
                                  handleRemoveVideoFromForm(videoId)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow className="dark:border-gray-700">
                        <TableCell colSpan={2} className="text-center dark:text-gray-400">
                          Bu kursga hali video qo'shilmagan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <h4 className="font-medium mb-4 dark:text-white">Yangi video qo'shish</h4>
              
              {/* Google Drive video havolasi */}
              <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <h5 className="font-medium mb-3 text-sm dark:text-white">Google Drive video havolasi</h5>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-video-title" className="text-sm dark:text-gray-300">
                      Video sarlavha (majburiy)
                    </Label>
                    <Input
                      id="new-video-title"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="Video sarlavhasi"
                      className="mt-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-video-url" className="text-sm dark:text-gray-300">
                      Google Drive havolasi (majburiy)
                    </Label>
                    <Input
                      id="new-video-url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/VIDEO_ID/view"
                      className="mt-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Google Drive video havolasini kiriting. Preview formatida ko'rsatiladi.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="new-video-description" className="text-sm dark:text-gray-300">
                      Tavsif (ixtiyoriy)
                    </Label>
                    <Textarea
                      id="new-video-description"
                      value={newVideoDescription}
                      onChange={(e) => setNewVideoDescription(e.target.value)}
                      placeholder="Video haqida qisqacha ma'lumot"
                      className="mt-1 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:placeholder-gray-400"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleAddVideoFromUrl}
                    disabled={!newVideoUrl || !newVideoTitle}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Google Drive videoni qo'shish
                  </Button>
                </div>
              </div>

              {/* Mavjud videolarni tanlash */}
              <div className="mb-4">
                <h5 className="font-medium mb-3 text-sm dark:text-white">Yoki mavjud videolarni tanlash</h5>
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <VideoCombobox
                        videos={videos.filter(
                          (video) => !courseVideos.includes(String(video.id))
                        )}
                      selectedVideos={videosToAddToForm}
                      onChange={setVideosToAddToForm}
                    />
                  </div>
                  <Button
                    onClick={handleAddVideosToForm}
                    disabled={videosToAddToForm.length === 0}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Qo'shish
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-4">
            <Button
              onClick={handleSaveCourse}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {selectedCourse ? "O'zgarishlarni saqlash" : "Kursni yaratish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yangi Tarif yaratish/Tahrirlash Dialog */}
      <Dialog open={isTariffFormOpen} onOpenChange={(open) => {
        setIsTariffFormOpen(open);
        if (!open) {
          setTariffName("");
          setTariffDescription("");
          setTariffPrice(0);
          setSelectedTariff(null);
          setIsEditingTariff(false);
        }
      }}>
        <DialogContent className="max-w-lg dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {isEditingTariff ? "Tarifni tahrirlash" : "Yangi tarif yaratish"}
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {isEditingTariff ? "Tarif ma'lumotlarini o'zgartiring." : "Tarif nomi, tavsifi va narxini kiriting."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="tariff-name" className="dark:text-gray-300">Tarif nomi</Label>
              <Input id="tariff-name" value={tariffName} onChange={(e) => setTariffName(e.target.value)} placeholder="Masalan: BAZZA" className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
            </div>
            <div>
              <Label htmlFor="tariff-desc" className="dark:text-gray-300">Tavsif</Label>
              <Textarea id="tariff-desc" value={tariffDescription} onChange={(e) => setTariffDescription(e.target.value)} placeholder="Tarif haqida qisqacha ma'lumot" className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" rows={3} />
            </div>
            <div>
              <Label htmlFor="tariff-price" className="dark:text-gray-300">Narx</Label>
              <Input id="tariff-price" type="number" value={tariffPrice} onChange={(e) => setTariffPrice(parseFloat(e.target.value) || 0)} className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => {
              setIsTariffFormOpen(false);
              setTariffName("");
              setTariffDescription("");
              setTariffPrice(0);
              setSelectedTariff(null);
              setIsEditingTariff(false);
            }} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">Bekor qilish</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-60" onClick={handleSaveTariff} disabled={isCreatingTariff} type="button">
              {isCreatingTariff ? 'Saqlanmoqda...' : isEditingTariff ? 'Yangilash' : 'Saqlash'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs: Video Upload, Video Edit, User Courses */}
      <Dialog
        open={isVideoUploadFormOpen}
        onOpenChange={setIsVideoUploadFormOpen}
      >
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Yangi video yuklash</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Videoni yuklang va unga sarlavha va tavsif qo'shing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-title" className="text-right dark:text-gray-300">
                Sarlavha
              </Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-description" className="text-right dark:text-gray-300">
                Tavsif
              </Label>
              <Textarea
                id="video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="video-file" className="text-right dark:text-gray-300">
                    Video fayli
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setCurrentVideoFile(e.target.files ? e.target.files[0] : null)
                      }
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    {currentVideoFile && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Fayl: {currentVideoFile.name} ({(currentVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                        {currentVideoFile.size > 5 * 1024 * 1024 && (
                          <span className="text-red-500 dark:text-red-400"> - Fayl juda katta!</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Maksimal hajm: 5MB (Vercel chegarasi)
                    </p>
                  </div>
                </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleVideoUpload}
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Yuklanmoqda..." : "Yuklash"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isVideoEditFormOpen} onOpenChange={setIsVideoEditFormOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Videoni tahrirlash</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Video ma'lumotlarini o'zgartirishingiz mumkin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-video-title" className="text-right dark:text-gray-300">
                Sarlavha
              </Label>
              <Input
                id="edit-video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-video-description" className="text-right dark:text-gray-300">
                Tavsif
              </Label>
              <Textarea
                id="edit-video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={async () => {
                if (!selectedVideo) return;
                try {
                  await VideoService.update(String(selectedVideo.id), {
                    title: videoTitle,
                    description: videoDescription,
                  });
                  fetchVideos();
                  setIsVideoEditFormOpen(false);
                  toast({
                    title: "Muvaffaqiyatli!",
                    description: "Video ma'lumotlari yangilandi.",
                  });
                } catch (error) {
                  console.error("Videoni yangilashda xato:", error);
                  toast({
                    title: "Xatolik!",
                    description: "Videoni yangilashda xatolik yuz berdi.",
                    variant: "destructive",
                  });
                }
              }}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isUserCoursesFormOpen}
        onOpenChange={(open) => {
          setIsUserCoursesFormOpen(open);
          if (!open) {
            setUserTariffId(null);
            setUserTariffLessons([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Foydalanuvchi kurslarini tahrirlash</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              {selectedUser?.first_name} {selectedUser?.last_name} uchun tarif belgilang va kurslarni qo'shing yoki olib tashlang.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <div className="mb-6">
              <Label htmlFor="user-tariff" className="text-base font-medium mb-2 block dark:text-white">
                Tarif tanlash
              </Label>
              <select
                id="user-tariff"
                value={userTariffId || ''}
                onChange={(e) => handleUserTariffChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Tarif tanlanmagan</option>
                {tariffs.map((tariff) => (
                  <option key={tariff.id} value={tariff.id}>
                    {tariff.name} - {tariff.price.toLocaleString()} so'm
                  </option>
                ))}
              </select>
            </div>
            
            {userTariffLessons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4 dark:text-white">Tarif ichidagi darslar</h3>
                <div className="rounded-md border dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="dark:text-gray-300">#</TableHead>
                        <TableHead className="dark:text-gray-300">Dars nomi</TableHead>
                        <TableHead className="dark:text-gray-300">Tavsif</TableHead>
                        <TableHead className="dark:text-gray-300">Video</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userTariffLessons.map((lesson, index) => (
                        <TableRow key={lesson.id} className="dark:border-gray-700 dark:hover:bg-gray-700/50">
                          <TableCell className="dark:text-white">{index + 1}</TableCell>
                          <TableCell className="font-medium dark:text-white">{lesson.title}</TableCell>
                          <TableCell className="dark:text-gray-300">{lesson.description || '-'}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            {lesson.video_url ? (
                              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline dark:text-blue-400">
                                Ko'rish
                              </a>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            
            <h3 className="text-lg font-medium mb-4 dark:text-white">Mavjud kurslar</h3>
            <div className="rounded-md border mb-4 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Kurs nomi</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Harakat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCourses.length > 0 ? (
                    userCourses.map((courseId) => {
                        const course = courses.find((c) => String(c.id) === courseId);
                      if (!course) return null;
                      return (
                        <TableRow key={courseId} className="dark:border-gray-700 dark:hover:bg-gray-700/50">
                          <TableCell className="font-medium dark:text-white">
                            {course.title}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                              onClick={() =>
                                setUserCourses(
                                  userCourses.filter((id) => id !== courseId)
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="dark:border-gray-700">
                      <TableCell colSpan={2} className="text-center dark:text-gray-400">
                        Foydalanuvchida kurslar mavjud emas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <h4 className="font-medium mb-2 dark:text-white">Yangi kurs qo'shish</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <CourseCombobox
                  courses={courses.filter(
                    (course) => !userCourses.includes(String(course.id))
                  )}
                  selectedCourses={coursesToAddToUser}
                  onChange={setCoursesToAddToUser}
                />
              </div>
              <Button
                onClick={() => {
                  setUserCourses([
                    ...new Set([...userCourses, ...coursesToAddToUser]),
                  ]);
                  setCoursesToAddToUser([]);
                }}
                disabled={coursesToAddToUser?.length === 0}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Qo'shish
              </Button>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-4">
            <Button
              onClick={handleUpdateUserCourses}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Darslar ko'rish va boshqarish Dialog */}
      <Dialog open={isLessonsViewOpen} onOpenChange={setIsLessonsViewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="dark:text-white">
                  {selectedTariff?.name} - Darslar
                </DialogTitle>
                <DialogDescription className="dark:text-gray-400">
                  {lessons.length} ta dars • {selectedTariff?.price.toLocaleString()} so'm
                </DialogDescription>
              </div>
              <Button
                onClick={() => {
                  setSelectedLesson(null);
                  setLessonTitle("");
                  setLessonDescription("");
                  setLessonVideoUrl("");
                  setLessonOrderNumber(lessons.length + 1);
                  setLessonAdditionalResources([]);
                  setIsLessonFormOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Yangi dars qo'shish
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            {lessons.length === 0 ? (
              <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Darslar yo'q</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Bu tarifda hozircha darslar mavjud emas.
                </p>
                <Button
                  onClick={() => {
                    setSelectedLesson(null);
                    setLessonTitle("");
                    setLessonDescription("");
                    setLessonVideoUrl("");
                    setLessonOrderNumber(1);
                    setLessonAdditionalResources([]);
                    setIsLessonFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Birinchi darsni qo'shish
                </Button>
              </Card>
            ) : (
              <div className="rounded-md border dark:border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">#</TableHead>
                      <TableHead className="dark:text-gray-300">Dars nomi</TableHead>
                      <TableHead className="dark:text-gray-300">Tavsif</TableHead>
                      <TableHead className="dark:text-gray-300">Video</TableHead>
                      <TableHead className="dark:text-gray-300">Harakatlar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson, index) => (
                      <TableRow key={lesson.id} className="dark:border-gray-700 dark:hover:bg-gray-700/50">
                        <TableCell className="dark:text-white">{lesson.order_number || index + 1}</TableCell>
                        <TableCell className="font-medium dark:text-white">{lesson.title}</TableCell>
                        <TableCell className="dark:text-gray-300 max-w-md">
                          <p className="truncate" title={lesson.description || '-'}>
                            {lesson.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {lesson.video_url ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs dark:bg-green-700 dark:text-green-200">
                                Video mavjud
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // URL orqali videoni ko'rsatish
                                  const videoUrl = lesson.video_url || '';
                                  if (videoUrl) {
                                    // URL ni encode qilish va watch sahifasiga yuborish
                                    const encodedUrl = encodeURIComponent(videoUrl);
                                    window.open(`/watch/${encodedUrl}`, '_blank');
                                  }
                                }}
                                className="h-7 px-2 text-xs dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700 dark:border-blue-500"
                                title="Videoni ko'rish"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ko'rish
                              </Button>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                              Video yo'q
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLesson(lesson);
                                setLessonTitle(lesson.title);
                                setLessonDescription(lesson.description || "");
                                setLessonVideoUrl(lesson.video_url || "");
                                setLessonOrderNumber(lesson.order_number);
                                setIsLessonFormOpen(true);
                              }}
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                              onClick={async () => {
                                if (window.confirm("Haqiqatan ham bu darsni o'chirmoqchimisiz?")) {
                                  try {
                                    await LessonService.remove(String(lesson.id));
                                    await fetchLessons(selectedTariff!.id);
                                    toast({
                                      title: "Muvaffaqiyatli!",
                                      description: "Dars o'chirildi",
                                    });
                                  } catch (error) {
                                    console.error("Darsni o'chirishda xato:", error);
                                    toast({
                                      title: "Xatolik",
                                      description: "Darsni o'chirishda xatolik yuz berdi",
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Yangi dars qo'shish Dialog */}
      <Dialog open={isLessonFormOpen} onOpenChange={setIsLessonFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Yangi dars qo'shish</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Dars ma'lumotlarini to'ldiring
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="lesson-title" className="dark:text-gray-300">
                Sarlavha (majburiy)
              </Label>
              <Input
                id="lesson-title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Dars sarlavhasi"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description" className="dark:text-gray-300">
                Tavsif (majburiy)
              </Label>
              <Textarea
                id="lesson-description"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Dars haqida batafsil ma'lumot"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                rows={4}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {lessonDescription.length} belgi
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-video-url" className="dark:text-gray-300">
                Video havola (ixtiyoriy)
              </Label>
              <Input
                id="lesson-video-url"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="Google Drive havolasi yoki to'g'ridan-to'g'ri video URL"
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Google Drive preview linkini kiriting: https://drive.google.com/file/d/VIDEO_ID/preview
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-order" className="dark:text-gray-300">
                Tartib raqami
              </Label>
              <Input
                id="lesson-order"
                type="number"
                value={lessonOrderNumber}
                onChange={(e) => setLessonOrderNumber(parseInt(e.target.value) || 1)}
                className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Darsning tartibi (1, 2, 3, ...)
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-resources" className="dark:text-gray-300">
                Qo'shimcha resurslar (ixtiyoriy)
              </Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center dark:bg-gray-700">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  PDF, DOCX, ZIP fayllarni torting yoki tanlang
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bir nechta faylni tanlashingiz mumkin
                </p>
                <Input
                  id="lesson-resources"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={(e) => {
                    if (e.target.files) {
                      setLessonAdditionalResources(Array.from(e.target.files));
                    }
                  }}
                  className="mt-4 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLessonFormOpen(false);
                setLessonTitle("");
                setLessonDescription("");
                setLessonVideoUrl("");
                setLessonOrderNumber(1);
                setLessonAdditionalResources([]);
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleAddLesson}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Qo'shish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
