import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FestivalDay } from '../types';
import { getCurrentFestivalDay } from '../lib/festival-dates';

interface AppState {
  currentDay: FestivalDay;
  setCurrentDay: (day: FestivalDay) => void;
  activeFriendId: string | null;
  setActiveFriendId: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentDay: getCurrentFestivalDay(),
      setCurrentDay: (day) => set({ currentDay: day }),
      activeFriendId: null,
      setActiveFriendId: (id) => set({ activeFriendId: id }),
    }),
    { name: 'lolla-planner-app-state' },
  ),
);
