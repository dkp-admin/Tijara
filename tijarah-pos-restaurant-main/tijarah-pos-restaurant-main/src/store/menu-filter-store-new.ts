import { create } from "zustand";

type MenuFilterStore = {
  categoryId: string;
  setCategoryId: (d: string) => void;
};

export const useMenuFilterStore = create<MenuFilterStore>((set) => ({
  categoryId: "all",
  setCategoryId: (d: string) => {
    set({ categoryId: d });
  },
}));
