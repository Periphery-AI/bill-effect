import { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps';
import { EventPopup, EventMarker } from './EventPopup';
import { stateCoordinates } from '../utils/stateCoordinates';
import type { SimulationEvent } from '../types';

const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface TooltipState {
  name: string;
  x: number;
  y: number;
}

interface MapViewProps {
  events?: SimulationEvent[];
}

export function MapView({ events = [] }: MapViewProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Group events by state
  const eventsByState = useMemo(() => {
    const grouped: Record<string, SimulationEvent[]> = {};
    for (const event of events) {
      if (!grouped[event.state]) {
        grouped[event.state] = [];
      }
      grouped[event.state].push(event);
    }
    return grouped;
  }, [events]);

  // Determine overall impact for a state (for marker coloring)
  const getStateImpact = useCallback((stateEvents: SimulationEvent[]): 'positive' | 'negative' | 'neutral' | 'mixed' => {
    const impacts = new Set(stateEvents.map(e => e.impact));
    if (impacts.size > 1) return 'mixed';
    return stateEvents[0]?.impact ?? 'neutral';
  }, []);

  // Handle marker click
  const handleMarkerClick = useCallback((stateName: string, screenX: number, screenY: number) => {
    if (selectedState === stateName) {
      setSelectedState(null);
      setPopupPosition(null);
    } else {
      setSelectedState(stateName);
      setPopupPosition({ x: screenX, y: screenY });
    }
  }, [selectedState]);

  // Close popup when clicking elsewhere
  const handleBackgroundClick = useCallback(() => {
    setSelectedState(null);
    setPopupPosition(null);
  }, []);

  return (
    <div className="map-view" onClick={handleBackgroundClick}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{
          scale: 1000,
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <Geographies geography={US_TOPO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const stateName = geo.properties.name;
              const hasEvents = eventsByState[stateName]?.length > 0;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  className={`us-state ${hasEvents ? 'has-events' : ''}`}
                  onMouseEnter={(evt) => {
                    setTooltip({
                      name: stateName,
                      x: evt.clientX,
                      y: evt.clientY,
                    });
                  }}
                  onMouseMove={(evt) => {
                    if (tooltip) {
                      setTooltip((prev) =>
                        prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null
                      );
                    }
                  }}
                  onMouseLeave={() => {
                    setTooltip(null);
                  }}
                  style={{
                    default: {
                      fill: hasEvents ? 'var(--bg-accent)' : 'var(--bg)',
                      stroke: 'var(--stroke)',
                      strokeWidth: 0.5,
                      outline: 'none',
                    },
                    hover: {
                      fill: 'var(--accent)',
                      stroke: 'var(--ink)',
                      strokeWidth: 1,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: 'var(--accent-2)',
                      outline: 'none',
                    },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Event markers */}
        {Object.entries(eventsByState).map(([stateName, stateEvents]) => {
          const coords = stateCoordinates[stateName]?.coordinates;
          if (!coords) return null;

          return (
            <Marker
              key={stateName}
              coordinates={coords}
              onClick={(evt) => {
                evt.stopPropagation();
                // Get the position of the click for popup placement
                const mouseEvent = evt as unknown as React.MouseEvent;
                handleMarkerClick(stateName, mouseEvent.clientX, mouseEvent.clientY);
              }}
            >
              <EventMarker
                eventCount={stateEvents.length}
                impact={getStateImpact(stateEvents)}
                isSelected={selectedState === stateName}
                onClick={() => {}}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* State name tooltip */}
      {tooltip && !selectedState && (
        <div
          className="map-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
          }}
        >
          {tooltip.name}
          {eventsByState[tooltip.name] && (
            <span className="tooltip-event-count">
              {' '}({eventsByState[tooltip.name].length} event{eventsByState[tooltip.name].length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )}

      {/* Event popup */}
      {selectedState && popupPosition && eventsByState[selectedState] && (
        <div onClick={(e) => e.stopPropagation()}>
          <EventPopup
            events={eventsByState[selectedState]}
            position={popupPosition}
            stateName={selectedState}
          />
        </div>
      )}
    </div>
  );
}
