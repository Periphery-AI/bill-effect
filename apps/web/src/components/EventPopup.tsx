import { useState } from 'react';
import type { SimulationEvent } from '../types';

interface EventPopupProps {
  events: SimulationEvent[];
  position: { x: number; y: number };
  stateName: string;
}

export function EventPopup({ events, position, stateName }: EventPopupProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (events.length === 0) return null;

  const impactColors = {
    positive: 'var(--accent-2)',
    negative: 'var(--accent)',
    neutral: 'var(--muted)',
  };

  const impactIcons = {
    positive: '↑',
    negative: '↓',
    neutral: '→',
  };

  return (
    <div
      className="event-popup-container"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="event-popup-header">
        <span className="event-popup-state">{stateName}</span>
        <span className="event-popup-count">{events.length} event{events.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="event-popup-list">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`event-popup-item ${expanded === event.id ? 'expanded' : ''}`}
            style={{
              animationDelay: `${index * 100}ms`,
              borderLeftColor: impactColors[event.impact],
            }}
            onClick={() => setExpanded(expanded === event.id ? null : event.id)}
          >
            <div className="event-popup-item-header">
              <span
                className="event-impact-icon"
                style={{ color: impactColors[event.impact] }}
              >
                {impactIcons[event.impact]}
              </span>
              <span className="event-popup-title">{event.title}</span>
            </div>
            {expanded === event.id && (
              <div className="event-popup-details">
                <p className="event-popup-description">{event.description}</p>
                <span className="event-popup-date">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Marker component that shows on the map at state positions
interface EventMarkerProps {
  eventCount: number;
  impact: 'positive' | 'negative' | 'neutral' | 'mixed';
  onClick: () => void;
  isSelected: boolean;
}

export function EventMarker({ eventCount, impact, onClick, isSelected }: EventMarkerProps) {
  const impactColors = {
    positive: 'var(--accent-2)',
    negative: 'var(--accent)',
    neutral: 'var(--muted)',
    mixed: '#8b5cf6', // purple for mixed impact
  };

  return (
    <g
      className={`event-marker ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <circle
        r={isSelected ? 14 : 10}
        fill={impactColors[impact]}
        className="event-marker-bg"
      />
      <circle
        r={isSelected ? 14 : 10}
        fill="none"
        stroke="white"
        strokeWidth={2}
        className="event-marker-ring"
      />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={isSelected ? 11 : 9}
        fontWeight={600}
        className="event-marker-count"
      >
        {eventCount}
      </text>
    </g>
  );
}
