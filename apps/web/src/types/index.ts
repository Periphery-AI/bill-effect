// Key point extracted from bill analysis
export interface KeyPoint {
  id: string;
  title: string;
  summary: string;
  category: 'healthcare' | 'economy' | 'environment' | 'education' | 'infrastructure' | 'defense' | 'social' | 'other';
}

// Bill types
export interface Bill {
  id: string;
  title: string;
  content: string;
  uploadedAt: Date;
  keyPoints?: KeyPoint[];
}

// Event types
export interface SimulationEvent {
  id: string;
  state: string;
  date: Date;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  currentDate: Date;
  startDate: Date;
  endDate: Date;
}

// Store state
export interface AppState {
  bill: Bill | null;
  events: SimulationEvent[];
  playback: PlaybackState;
}
