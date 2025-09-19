import { Video } from "./video";

export interface Course {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category: string[];
  videos: Video[];
  createdAt: string;
  updatedAt: string;
}
