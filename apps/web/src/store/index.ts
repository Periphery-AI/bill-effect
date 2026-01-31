import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Bill, SimulationEvent, PlaybackState } from '../types';

// Actions interface
interface AppActions {
  // Bill actions
  setBill: (bill: Bill | null) => void;
  clearBill: () => void;

  // Event actions
  addEvent: (event: SimulationEvent) => void;
  addEvents: (events: SimulationEvent[]) => void;
  clearEvents: () => void;
  getEventsUpToDate: (date: Date) => SimulationEvent[];

  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setCurrentDate: (date: Date) => void;
  setSpeed: (speed: 1 | 2 | 5) => void;
  setDateRange: (startDate: Date, endDate: Date) => void;
  resetPlayback: () => void;

  // Simulation actions
  resetSimulation: () => void;
}

// Full store state
interface AppStore extends AppActions {
  bill: Bill | null;
  events: SimulationEvent[];
  playback: PlaybackState;
}

// Create initial dates
const createInitialDates = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setFullYear(endDate.getFullYear() + 2);

  return { today, endDate };
};

const { today, endDate } = createInitialDates();

// Initial playback state
const initialPlayback: PlaybackState = {
  isPlaying: false,
  speed: 1,
  currentDate: new Date(today),
  startDate: new Date(today),
  endDate: new Date(endDate),
};

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  bill: null,
  events: [],
  playback: initialPlayback,

  // Bill actions
  setBill: (bill) => set({ bill }),

  clearBill: () => set({ bill: null }),

  // Event actions
  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  addEvents: (events) =>
    set((state) => ({
      events: [...state.events, ...events],
    })),

  clearEvents: () => set({ events: [] }),

  getEventsUpToDate: (date) => {
    const { events } = get();
    return events.filter((event) => event.date <= date);
  },

  // Playback actions
  play: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: true },
    })),

  pause: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: false },
    })),

  togglePlayback: () =>
    set((state) => ({
      playback: { ...state.playback, isPlaying: !state.playback.isPlaying },
    })),

  setCurrentDate: (date) =>
    set((state) => ({
      playback: { ...state.playback, currentDate: date },
    })),

  setSpeed: (speed) =>
    set((state) => ({
      playback: { ...state.playback, speed },
    })),

  setDateRange: (startDate, endDate) =>
    set((state) => ({
      playback: { ...state.playback, startDate, endDate },
    })),

  resetPlayback: () => {
    const { today: newToday, endDate: newEndDate } = createInitialDates();
    set({
      playback: {
        isPlaying: false,
        speed: 1,
        currentDate: new Date(newToday),
        startDate: new Date(newToday),
        endDate: new Date(newEndDate),
      },
    });
  },

  // Simulation actions
  resetSimulation: () => {
    const { today: newToday, endDate: newEndDate } = createInitialDates();
    set({
      bill: null,
      events: [],
      playback: {
        isPlaying: false,
        speed: 1,
        currentDate: new Date(newToday),
        startDate: new Date(newToday),
        endDate: new Date(newEndDate),
      },
    });
  },
}));

// Selector hooks for convenience
export const useBill = () => useAppStore((state) => state.bill);
export const useEvents = () => useAppStore((state) => state.events);
export const usePlayback = () => useAppStore((state) => state.playback);

// Action hooks
export const useBillActions = () =>
  useAppStore(
    useShallow((state) => ({
      setBill: state.setBill,
      clearBill: state.clearBill,
    }))
  );

export const useEventActions = () =>
  useAppStore(
    useShallow((state) => ({
      addEvent: state.addEvent,
      addEvents: state.addEvents,
      clearEvents: state.clearEvents,
      getEventsUpToDate: state.getEventsUpToDate,
    }))
  );

export const usePlaybackActions = () =>
  useAppStore(
    useShallow((state) => ({
      play: state.play,
      pause: state.pause,
      togglePlayback: state.togglePlayback,
      setCurrentDate: state.setCurrentDate,
      setSpeed: state.setSpeed,
      setDateRange: state.setDateRange,
      resetPlayback: state.resetPlayback,
    }))
  );
