import { useCallback, useRef, useEffect } from 'react';
import { usePlayback, usePlaybackActions } from '../store';

interface TimelineProps {
  onSimulationStart?: () => void;
  isAnalyzing?: boolean;
  hasBill?: boolean;
  hasEvents?: boolean;
}

export function Timeline({ onSimulationStart, isAnalyzing, hasBill, hasEvents }: TimelineProps) {
  const playback = usePlayback();
  const { togglePlayback, setCurrentDate, setSpeed, pause } = usePlaybackActions();

  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDays = Math.ceil(
    (playback.endDate.getTime() - playback.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const currentDays = Math.ceil(
    (playback.currentDate.getTime() - playback.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const progress = Math.min(100, Math.max(0, (currentDays / totalDays) * 100));

  const handlePlayClick = useCallback(() => {
    // If we have a bill but no events yet, start simulation
    if (hasBill && !hasEvents && !playback.isPlaying && onSimulationStart) {
      onSimulationStart();
      return;
    }
    // Otherwise toggle playback
    togglePlayback();
  }, [hasBill, hasEvents, playback.isPlaying, onSimulationStart, togglePlayback]);

  const handleSpeedChange = useCallback((speed: 1 | 2 | 5) => {
    setSpeed(speed);
  }, [setSpeed]);

  const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(1, Math.max(0, clickX / rect.width));

    const daysFromStart = Math.floor(percentage * totalDays);
    const newDate = new Date(playback.startDate);
    newDate.setDate(newDate.getDate() + daysFromStart);

    setCurrentDate(newDate);
  }, [totalDays, playback.startDate, setCurrentDate]);

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

      setCurrentDate(newDate);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [totalDays, playback.startDate, setCurrentDate]);

  // Playback interval effect
  useEffect(() => {
    if (playback.isPlaying) {
      // Advance one day every 1000ms / speed
      const intervalMs = 1000 / playback.speed;

      intervalRef.current = setInterval(() => {
        const newDate = new Date(playback.currentDate);
        newDate.setDate(newDate.getDate() + 1);

        // Stop at end date
        if (newDate >= playback.endDate) {
          setCurrentDate(playback.endDate);
          pause();
        } else {
          setCurrentDate(newDate);
        }
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
  }, [playback.isPlaying, playback.speed, playback.currentDate, playback.endDate, setCurrentDate, pause]);

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

  // Determine button state
  const isDisabled = isAnalyzing || (!hasBill && !hasEvents);
  const showLoader = isAnalyzing;

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button
          className={`play-btn ${showLoader ? 'loading' : ''}`}
          aria-label={playback.isPlaying ? 'Pause' : 'Play'}
          onClick={handlePlayClick}
          disabled={isDisabled}
        >
          {showLoader ? (
            <span className="loader">⏳</span>
          ) : playback.isPlaying ? (
            '⏸'
          ) : (
            '▶'
          )}
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
            onClick={() => handleSpeedChange(speed)}
          >
            {speed}x
          </button>
        ))}
      </div>
    </div>
  );
}
