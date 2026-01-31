// State centroid coordinates for positioning event markers on the map
// Coordinates are in [longitude, latitude] format for use with map projections

export interface StateCoordinate {
  name: string;
  abbr: string;
  coordinates: [number, number];
}

export const stateCoordinates: Record<string, StateCoordinate> = {
  'Alabama': { name: 'Alabama', abbr: 'AL', coordinates: [-86.9023, 32.8067] },
  'Alaska': { name: 'Alaska', abbr: 'AK', coordinates: [-153.4937, 64.2008] },
  'Arizona': { name: 'Arizona', abbr: 'AZ', coordinates: [-111.4312, 34.0489] },
  'Arkansas': { name: 'Arkansas', abbr: 'AR', coordinates: [-92.3731, 34.7465] },
  'California': { name: 'California', abbr: 'CA', coordinates: [-119.4179, 36.7783] },
  'Colorado': { name: 'Colorado', abbr: 'CO', coordinates: [-105.3111, 39.0598] },
  'Connecticut': { name: 'Connecticut', abbr: 'CT', coordinates: [-72.7554, 41.5978] },
  'Delaware': { name: 'Delaware', abbr: 'DE', coordinates: [-75.5071, 38.9108] },
  'Florida': { name: 'Florida', abbr: 'FL', coordinates: [-81.5158, 27.6648] },
  'Georgia': { name: 'Georgia', abbr: 'GA', coordinates: [-83.5002, 32.1656] },
  'Hawaii': { name: 'Hawaii', abbr: 'HI', coordinates: [-155.5828, 19.8968] },
  'Idaho': { name: 'Idaho', abbr: 'ID', coordinates: [-114.7420, 44.0682] },
  'Illinois': { name: 'Illinois', abbr: 'IL', coordinates: [-89.3985, 40.6331] },
  'Indiana': { name: 'Indiana', abbr: 'IN', coordinates: [-86.1349, 40.2672] },
  'Iowa': { name: 'Iowa', abbr: 'IA', coordinates: [-93.0977, 41.8780] },
  'Kansas': { name: 'Kansas', abbr: 'KS', coordinates: [-98.4842, 39.0119] },
  'Kentucky': { name: 'Kentucky', abbr: 'KY', coordinates: [-84.2700, 37.8393] },
  'Louisiana': { name: 'Louisiana', abbr: 'LA', coordinates: [-91.9623, 30.9843] },
  'Maine': { name: 'Maine', abbr: 'ME', coordinates: [-69.4455, 45.2538] },
  'Maryland': { name: 'Maryland', abbr: 'MD', coordinates: [-76.6413, 39.0458] },
  'Massachusetts': { name: 'Massachusetts', abbr: 'MA', coordinates: [-71.5314, 42.4072] },
  'Michigan': { name: 'Michigan', abbr: 'MI', coordinates: [-85.6024, 44.3148] },
  'Minnesota': { name: 'Minnesota', abbr: 'MN', coordinates: [-94.6859, 46.7296] },
  'Mississippi': { name: 'Mississippi', abbr: 'MS', coordinates: [-89.3985, 32.3547] },
  'Missouri': { name: 'Missouri', abbr: 'MO', coordinates: [-91.8318, 37.9643] },
  'Montana': { name: 'Montana', abbr: 'MT', coordinates: [-110.3626, 46.8797] },
  'Nebraska': { name: 'Nebraska', abbr: 'NE', coordinates: [-99.9018, 41.4925] },
  'Nevada': { name: 'Nevada', abbr: 'NV', coordinates: [-116.4194, 38.8026] },
  'New Hampshire': { name: 'New Hampshire', abbr: 'NH', coordinates: [-71.5724, 43.1939] },
  'New Jersey': { name: 'New Jersey', abbr: 'NJ', coordinates: [-74.4057, 40.0583] },
  'New Mexico': { name: 'New Mexico', abbr: 'NM', coordinates: [-105.8701, 34.5199] },
  'New York': { name: 'New York', abbr: 'NY', coordinates: [-75.4999, 43.2994] },
  'North Carolina': { name: 'North Carolina', abbr: 'NC', coordinates: [-79.0193, 35.7596] },
  'North Dakota': { name: 'North Dakota', abbr: 'ND', coordinates: [-101.0020, 47.5515] },
  'Ohio': { name: 'Ohio', abbr: 'OH', coordinates: [-82.9071, 40.4173] },
  'Oklahoma': { name: 'Oklahoma', abbr: 'OK', coordinates: [-97.0929, 35.0078] },
  'Oregon': { name: 'Oregon', abbr: 'OR', coordinates: [-120.5542, 43.8041] },
  'Pennsylvania': { name: 'Pennsylvania', abbr: 'PA', coordinates: [-77.1945, 41.2033] },
  'Rhode Island': { name: 'Rhode Island', abbr: 'RI', coordinates: [-71.4774, 41.5801] },
  'South Carolina': { name: 'South Carolina', abbr: 'SC', coordinates: [-81.1637, 33.8361] },
  'South Dakota': { name: 'South Dakota', abbr: 'SD', coordinates: [-99.9018, 43.9695] },
  'Tennessee': { name: 'Tennessee', abbr: 'TN', coordinates: [-86.5804, 35.5175] },
  'Texas': { name: 'Texas', abbr: 'TX', coordinates: [-99.9018, 31.9686] },
  'Utah': { name: 'Utah', abbr: 'UT', coordinates: [-111.0937, 39.3210] },
  'Vermont': { name: 'Vermont', abbr: 'VT', coordinates: [-72.5778, 44.5588] },
  'Virginia': { name: 'Virginia', abbr: 'VA', coordinates: [-78.6569, 37.4316] },
  'Washington': { name: 'Washington', abbr: 'WA', coordinates: [-120.7401, 47.7511] },
  'West Virginia': { name: 'West Virginia', abbr: 'WV', coordinates: [-80.4549, 38.5976] },
  'Wisconsin': { name: 'Wisconsin', abbr: 'WI', coordinates: [-89.6165, 43.7844] },
  'Wyoming': { name: 'Wyoming', abbr: 'WY', coordinates: [-107.2903, 43.0759] },
  'District of Columbia': { name: 'District of Columbia', abbr: 'DC', coordinates: [-77.0369, 38.9072] },
};

// Get coordinates by state name
export function getStateCoordinates(stateName: string): [number, number] | null {
  const state = stateCoordinates[stateName];
  return state ? state.coordinates : null;
}

// Get state abbreviation by name
export function getStateAbbr(stateName: string): string | null {
  const state = stateCoordinates[stateName];
  return state ? state.abbr : null;
}
