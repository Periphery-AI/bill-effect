import { useState, useCallback, useRef, useEffect } from 'react';
import type { PlaybackState } from '../types';

interface TimelineProps {
  onPlaybackChange?: (state: PlaybackState) => void;
}

export function Timeline({ onPlaybackChange }: TimelineProps) {
  const today = new Date();
  const defaultEndDate = new Date(today);
  defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 2);

  const [playback, setPlayback] = useState<PlaybackState>({
    isPlaying: false,
    speed: 1,
    currentDate: new Date(today),
    startDate: new Date(today),
    endDate: defaultEndDate,
  });

  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDays = Math.ceil(
    (playback.endDate.getTime() - playback.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentDays = Math.ceil(
    (playback.currentDate.getTime() - playback.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const progress = Math.min(100, Math.max(0, (currentDays / totalDays) * 100));

  const updatePlayback = useCallback((updates: Partial<PlaybackState>) => {
    setPlayback((prev) => {
      const newState = { ...prev, ...updates };
      onPlaybackChange?.(newState);
      return newState;
    });
  }, [onPlaybackChange]);

  const togglePlay = useCallback(() => {
    updatePlayback({ isPlaying: !playback.isPlaying });
  }, [playback.isPlaying, updatePlayback]);

  const setSpeed = useCallback((speed: 1 | 2 | 5) => {
    updatePlayback({ speed });
  }, [updatePlayback]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(1, Math.max(0, clickX / rect.width));

    const daysFromStart = Math.floor(percentage * totalDays);
    const newDate = new Date(playback.startDate);
    newDate.setDate(newDate.getDate() + daysFromStart);

    updatePlayback({ currentDate: newDate });
  }, [totalDays, playback.startDate, updatePlayback]);

  // Handle dragging the scrubber
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const clickX = moveEvent.clientX - rect.left;
      const percentage = Math.min(1, Math.max(0, clickX / rect.width));

      const daysFromStart = Math.floor(percentage * totalDays);
      const newDate = new Date(playback.startDate);
      newDate.setDate(newDate.getDate() + daysFromStart);

      updatePlayback({ currentDate: newDate });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [totalDays, playback.startDate, updatePlayback]);

  // Playback interval effect
  useEffect(() => {
    if (playback.isPlaying) {
      // Advance one day every 1000ms / speed
      const intervalMs = 1000 / playback.speed;

      intervalRef.current = setInterval(() => {
        setPlayback((prev) => {
          const newDate = new Date(prev.currentDate);
          newDate.setDate(newDate.getDate() + 1);

          // Stop at end date
          if (newDate >= prev.endDate) {
            return { ...prev, currentDate: prev.endDate, isPlaying: false };
          }

          const newState = { ...prev, currentDate: newDate };
          onPlaybackChange?.(newState);
          return newState;
        });
      }, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playback.isPlaying, playback.speed, onPlaybackChange]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button
          className="play-btn"
          aria-label={playback.isPlaying ? 'Pause' : 'Play'}
          onClick={togglePlay}
        >
          {playback.isPlaying ? '⏸' : '▶'}
        </button>

        <div className="timeline-wrapper">
          <div className="timeline-dates">
            <span className="date-label start">{formatShortDate(playback.startDate)}</span>
            <span className="date-label end">{formatShortDate(playback.endDate)}</span>
          </div>
          <div
            className="timeline-track"
            ref={trackRef}
            onClick={handleTrackClick}
          >
            <div
              className="timeline-progress"
              style={{ width: `${progress}%` }}
            />
            <div
              className="timeline-scrubber"
              style={{ left: `${progress}%` }}
              onMouseDown={handleMouseDown}
            />
          </div>
        </div>

        <span className="current-date">{formatDate(playback.currentDate)}</span>
      </div>

      <div className="speed-controls">
        <span className="speed-label">Speed:</span>
        {([1, 2, 5] as const).map((speed) => (
          <button
            key={speed}
            className={`speed-btn ${playback.speed === speed ? 'active' : ''}`}
            onClick={() => setSpeed(speed)}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
