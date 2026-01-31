import { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';

const US_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface TooltipState {
  name: string;
  x: number;
  y: number;
}

export function MapView() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  return (
    <div className="map-view">
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
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                className="us-state"
                onMouseEnter={(evt) => {
                  const { name } = geo.properties;
                  setTooltip({
                    name,
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
                    fill: 'var(--bg)',
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
            ))
          }
        </Geographies>
      </ComposableMap>
      {tooltip && (
        <div
          className="map-tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 30,
          }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
