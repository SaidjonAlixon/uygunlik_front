export interface Video {
  id: number;
  _id?: string; // Backward compatibility
  title: string;
  description?: string;
  url: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}
