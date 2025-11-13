import { create } from "zustand";

type MenuTabProps = {
  tab: number;
  changeTab: (index: number) => void;
};

export const useMenuTab = create<MenuTabProps>((set) => ({
  tab: 0,
  changeTab: (index) => {
    set({ tab: index });
  },
}));
