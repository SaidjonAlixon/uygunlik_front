import { User } from "@/types/user";
import { create } from "zustand";
import UserService from "@/services/user.service";

interface UserStore {
  user: User | null | undefined;
  loading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  initializeUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: undefined,
  loading: true, // Initial loading state
  setUser: (user: User | null) => set({ user }),
  clearUser: () => set({ user: null }),
  initializeUser: async () => {
    set({ loading: true });
    try {
      const data = await UserService.getMe();
      set({ user: data.user, loading: false });
    } catch (error) {
      console.error("Failed to initialize user:", error);
      set({ user: null, loading: false });
    }
  },
}));
