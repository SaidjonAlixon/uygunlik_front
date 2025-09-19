import { Course } from "./course";

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  balance: number;
  courses: Course[];
  role: Role;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}
