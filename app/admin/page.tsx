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
} from "lucide-react";
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
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(true);

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

  // Check if admin exists, if not redirect to setup
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await fetch('/api/users/all', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.status === 401) {
          // No admin exists, redirect to setup
          router.push('/admin/setup');
        }
      } catch (error) {
        console.error('Check admin error:', error);
        // If error, assume no admin exists
        router.push('/admin/setup');
      }
    };

    if (user?.role !== Role.ADMIN) {
      checkAdminExists();
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
        video_url: lessonVideoUrl || undefined,
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

  const handleEditUserCoursesClick = (user: User) => {
    setSelectedUser(user);
    const currentUserCourseIds = user?.courses?.map(course => String(course.id)) || [];
    setUserCourses(currentUserCourseIds);
    setIsUserCoursesFormOpen(true);
  };

  const handleUpdateUserCourses = async () => {
    if (!selectedUser) return;
    try {
      await UserService.updateUserCourses(String(selectedUser?.id), userCourses);
      toast({
        title: "Muvaffaqiyatli!",
        description: `${selectedUser?.first_name}ning kurslari muvaffaqiyatli yangilandi.`,
      });
      setIsUserCoursesFormOpen(false);
      setSelectedUser(null);
      setUserCourses([]);
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

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Orqa fon rasmi */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/fon.png"
          alt="Background"
              className="w-full h-full object-cover opacity-50"
          style={{ 
            minHeight: '100vh',
            transform: 'scale(1.2)',
            transformOrigin: 'center',
            maxHeight: '100vh'
          }}
        />
      </div>
      <header className="bg-white border-b relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Panel
                </h1>
              </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Administrator
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Sozlamalar
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-300 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Foydalanuvchilar, to'lovlar va kurslarni boshqaring
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faol foydalanuvchilar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeUsers}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Kutilayotgan to'lovlar
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pendingPayments}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami daromad</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.totalRevenue}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tariffs">
          <TabsList className="mb-6">
            <TabsTrigger value="tariffs">Darslik</TabsTrigger>
            <TabsTrigger value="payments">To'lovlar</TabsTrigger>
            <TabsTrigger value="users">Foydalanuvchilar</TabsTrigger>
            <TabsTrigger value="settings">Sozlamalar</TabsTrigger>
          </TabsList>

          <TabsContent value="tariffs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Darslik</CardTitle>
                    <CardDescription>
                      Tariflar va ularning ichidagi darslarni boshqaring
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsTariffFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Yangi tarif qo'shish
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-600">Tariflar yuklanmoqda...</p>
                  </div>
                ) : tariffs.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Hozircha tariflar mavjud emas</p>
                    <Button
                      onClick={() => setIsTariffFormOpen(true)}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Birinchi tarifni qo'shish
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-4 gap-6">
                    {tariffs.map((tariff) => (
                    <Card key={tariff.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{tariff.name}</CardTitle>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                // Tarifni tahrirlash
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteTariff(tariff.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription className="mt-2">
                          {tariff.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-blue-600">
                            {tariff.price.toLocaleString()} so'm
                          </p>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-sm">
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
                          className="w-full bg-blue-600 hover:bg-blue-700"
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
            <Card>
              <CardHeader>
                <CardTitle>Foydalanuvchilarni boshqarish</CardTitle>
                <CardDescription>
                  Foydalanuvchilarni qidiring, ko'ring va ularning kurslarini
                  boshqaring.
                </CardDescription>
                <div className="pt-4">
                  <Input
                    placeholder="Foydalanuvchilarni ism yoki email bo'yicha qidirish..."
                    value={usersSearchTerm}
                    onChange={(e) => setUsersSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p>Foydalanuvchilar yuklanmoqda...</p>
                ) : users.length === 0 ? (
                  <p>Foydalanuvchilar topilmadi.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ism</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Roli</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Harakatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user?.id}>
                          <TableCell className="font-medium">
                            {user?.first_name}
                          </TableCell>
                          <TableCell>{user?.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user?.role === Role.ADMIN
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {user?.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={user?.status ? "default" : "outline"}
                              >
                                {user?.status ? "Faol" : "Nofaol"}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                className={user?.status ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
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
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user?.role !== 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => handleUpdateUserRole(String(user?.id), 'admin')}
                                >
                                  Admin qilish
                                </Button>
                              )}
                              {user?.role === 'admin' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600 border-gray-200 hover:bg-gray-50"
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
                  >
                    Oldingisi
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUsersPage((p) => p + 1)}
                    disabled={usersPage === usersTotalPages}
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
                              href={isGoogleDriveUrl(video.url || '') 
                                ? `/watch/${extractGoogleDriveFileId(video.url || '') || ''}`
                                : `/watch/${video.filename || video.url?.split("/").pop() || ''}`
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
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? "Kursni tahrirlash" : "Yangi kurs yaratish"}
            </DialogTitle>
            <DialogDescription>
              {selectedCourse
                ? "Kurs ma'lumotlarini va unga biriktirilgan videolarni boshqaring."
                : "Yangi kurs uchun ma'lumotlarni kiriting."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Sarlavha
                </Label>
                <Input
                  id="title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Tavsif
                </Label>
                <Textarea
                  id="description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Narxi
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={coursePrice}
                  onChange={(e) => setCoursePrice(parseFloat(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
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
                  className="col-span-3"
                  placeholder="Masalan: Ayollar salomatligi, Gormonlar"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div>
              <h3 className="text-lg font-medium mb-4">Kurs Videolari</h3>
              <div className="rounded-md border mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sarlavha</TableHead>
                      <TableHead className="text-right">Harakat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courseVideos.length > 0 ? (
                      courseVideos.map((videoId) => {
                        const video = videos.find((v) => String(v.id) === videoId);
                        if (!video) return null;
                        return (
                          <TableRow key={videoId}>
                            <TableCell className="font-medium">
                              <Link
                                href={isGoogleDriveUrl(video.url || '') 
                                  ? `/watch/preview?id=${extractGoogleDriveFileId(video.url || '') || ''}`
                                  : `/watch/${video.filename || video.url?.split("/").pop() || ''}`
                                }
                                className="hover:underline"
                                target="_blank"
                              >
                                {video.title}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
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
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          Bu kursga hali video qo'shilmagan.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <h4 className="font-medium mb-4">Yangi video qo'shish</h4>
              
              {/* Google Drive video havolasi */}
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <h5 className="font-medium mb-3 text-sm">Google Drive video havolasi</h5>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-video-title" className="text-sm">
                      Video sarlavha (majburiy)
                    </Label>
                    <Input
                      id="new-video-title"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      placeholder="Video sarlavhasi"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-video-url" className="text-sm">
                      Google Drive havolasi (majburiy)
                    </Label>
                    <Input
                      id="new-video-url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/VIDEO_ID/view"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Drive video havolasini kiriting. Preview formatida ko'rsatiladi.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="new-video-description" className="text-sm">
                      Tavsif (ixtiyoriy)
                    </Label>
                    <Textarea
                      id="new-video-description"
                      value={newVideoDescription}
                      onChange={(e) => setNewVideoDescription(e.target.value)}
                      placeholder="Video haqida qisqacha ma'lumot"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={handleAddVideoFromUrl}
                    disabled={!newVideoUrl || !newVideoTitle}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Google Drive videoni qo'shish
                  </Button>
                </div>
              </div>

              {/* Mavjud videolarni tanlash */}
              <div className="mb-4">
                <h5 className="font-medium mb-3 text-sm">Yoki mavjud videolarni tanlash</h5>
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
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button
              onClick={handleSaveCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              {selectedCourse ? "O'zgarishlarni saqlash" : "Kursni yaratish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Yangi Tarif yaratish Dialog */}
      <Dialog open={isTariffFormOpen} onOpenChange={setIsTariffFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yangi tarif yaratish</DialogTitle>
            <DialogDescription>Tarif nomi, tavsifi va narxini kiriting.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="tariff-name">Tarif nomi</Label>
              <Input id="tariff-name" value={tariffName} onChange={(e) => setTariffName(e.target.value)} placeholder="Masalan: BAZZA" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="tariff-desc">Tavsif</Label>
              <Textarea id="tariff-desc" value={tariffDescription} onChange={(e) => setTariffDescription(e.target.value)} placeholder="Tarif haqida qisqacha ma'lumot" className="mt-1" rows={3} />
            </div>
            <div>
              <Label htmlFor="tariff-price">Narx</Label>
              <Input id="tariff-price" type="number" value={tariffPrice} onChange={(e) => setTariffPrice(parseFloat(e.target.value))} className="mt-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTariffFormOpen(false)}>Bekor qilish</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60" onClick={handleCreateTariff} disabled={isCreatingTariff} type="button">
              {isCreatingTariff ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Dialogs: Video Upload, Video Edit, User Courses */}
      <Dialog
        open={isVideoUploadFormOpen}
        onOpenChange={setIsVideoUploadFormOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi video yuklash</DialogTitle>
            <DialogDescription>
              Videoni yuklang va unga sarlavha va tavsif qo'shing.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-title" className="text-right">
                Sarlavha
              </Label>
              <Input
                id="video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="video-description" className="text-right">
                Tavsif
              </Label>
              <Textarea
                id="video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="video-file" className="text-right">
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
                    />
                    {currentVideoFile && (
                      <p className="text-sm text-gray-500 mt-1">
                        Fayl: {currentVideoFile.name} ({(currentVideoFile.size / 1024 / 1024).toFixed(2)} MB)
                        {currentVideoFile.size > 5 * 1024 * 1024 && (
                          <span className="text-red-500"> - Fayl juda katta!</span>
                        )}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Maksimal hajm: 5MB (Vercel chegarasi)
                    </p>
                  </div>
                </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleVideoUpload}
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Yuklanmoqda..." : "Yuklash"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isVideoEditFormOpen} onOpenChange={setIsVideoEditFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Videoni tahrirlash</DialogTitle>
            <DialogDescription>
              Video ma'lumotlarini o'zgartirishingiz mumkin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-video-title" className="text-right">
                Sarlavha
              </Label>
              <Input
                id="edit-video-title"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-video-description" className="text-right">
                Tavsif
              </Label>
              <Textarea
                id="edit-video-description"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isUserCoursesFormOpen}
        onOpenChange={setIsUserCoursesFormOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Foydalanuvchi kurslarini tahrirlash</DialogTitle>
            <DialogDescription>
              {selectedUser?.first_name} {selectedUser?.last_name} uchun kurslarni qo'shing yoki olib
              tashlang.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <h3 className="text-lg font-medium mb-4">Mavjud kurslar</h3>
            <div className="rounded-md border mb-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kurs nomi</TableHead>
                    <TableHead className="text-right">Harakat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userCourses.length > 0 ? (
                    userCourses.map((courseId) => {
                        const course = courses.find((c) => String(c.id) === courseId);
                      if (!course) return null;
                      return (
                        <TableRow key={courseId}>
                          <TableCell className="font-medium">
                            {course.title}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
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
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        Foydalanuvchida kurslar mavjud emas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <h4 className="font-medium mb-2">Yangi kurs qo'shish</h4>
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
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button
              onClick={handleUpdateUserCourses}
              className="bg-red-600 hover:bg-red-700"
            >
              Saqlash
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Darslar ko'rish va boshqarish Dialog */}
      <Dialog open={isLessonsViewOpen} onOpenChange={setIsLessonsViewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>
                  {selectedTariff?.name} - Darslar
                </DialogTitle>
                <DialogDescription>
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Yangi dars qo'shish
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            {lessons.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Darslar yo'q</h3>
                <p className="text-gray-600 mb-6">
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
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Birinchi darsni qo'shish
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson) => (
                  <Card key={lesson.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{lesson.order_number}</Badge>
                            <h4 className="font-semibold">{lesson.title}</h4>
                          </div>
                          {lesson.description && (
                            <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                          )}
                          {lesson.video_url && (
                            <Badge variant="secondary" className="text-xs">
                              Video mavjud
                            </Badge>
                          )}
                        </div>
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
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Yangi dars qo'shish Dialog */}
      <Dialog open={isLessonFormOpen} onOpenChange={setIsLessonFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yangi dars qo'shish</DialogTitle>
            <DialogDescription>
              Dars ma'lumotlarini to'ldiring
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="lesson-title">
                Sarlavha (majburiy)
              </Label>
              <Input
                id="lesson-title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Dars sarlavhasi"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">
                Tavsif (majburiy)
              </Label>
              <Textarea
                id="lesson-description"
                value={lessonDescription}
                onChange={(e) => setLessonDescription(e.target.value)}
                placeholder="Dars haqida batafsil ma'lumot"
                className="mt-1"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {lessonDescription.length} belgi
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-video-url">
                Video havola (ixtiyoriy)
              </Label>
              <Input
                id="lesson-video-url"
                value={lessonVideoUrl}
                onChange={(e) => setLessonVideoUrl(e.target.value)}
                placeholder="Google Drive havolasi yoki to'g'ridan-to'g'ri video URL"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Drive preview linkini kiriting: https://drive.google.com/file/d/VIDEO_ID/preview
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-order">
                Tartib raqami
              </Label>
              <Input
                id="lesson-order"
                type="number"
                value={lessonOrderNumber}
                onChange={(e) => setLessonOrderNumber(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Darsning tartibi (1, 2, 3, ...)
              </p>
            </div>
            <div>
              <Label htmlFor="lesson-resources">
                Qo'shimcha resurslar (ixtiyoriy)
              </Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-1">
                  PDF, DOCX, ZIP fayllarni torting yoki tanlang
                </p>
                <p className="text-xs text-gray-500">
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
                  className="mt-4"
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              Qo'shish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
