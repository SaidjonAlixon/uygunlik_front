import api from "../lib/api";
import { Video } from "../types/video";

// Client-side DTOs for type safety
export interface CreateVideoDto {
  title: string;
  description?: string;
  duration?: number;
}

export interface UpdateVideoDto {
  title?: string;
  description?: string;
  duration?: number;
}

class VideoService {
  async create(file: File, createVideoDto: CreateVideoDto): Promise<Video> {
    // 413 Content Too Large muammosini chetlash uchun hozircha faqat metadata yuboramiz
    const payload: any = {
      title: createVideoDto.title,
      description: createVideoDto.description || "",
      filename: file?.name || `video_${Date.now()}.mp4`,
    };
    if (createVideoDto.duration) payload.duration = createVideoDto.duration;

    const response = await api.post("/videos", payload);
    return response.data;
  }

  async findAll(): Promise<Video[]> {
    const response = await api.get("/videos");
    return response.data;
  }

  async findOne(id: string): Promise<Video> {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  }

  async findByFilename(filename: string): Promise<Video> {
    const response = await api.get(`/videos/by-filename/${filename}`);
    return response.data;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const response = await api.patch(`/videos/${id}`, updateVideoDto);
    return response.data;
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/videos/${id}`);
  }
}

export default new VideoService();
