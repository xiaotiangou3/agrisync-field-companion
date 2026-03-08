/** Mock API service simulating satellite/sensor field data */
export interface FieldData {
  ndvi: number;
  predictedYield: number;
  soilMoisture: number;
  solarExposure: number;
}

export function fetchFieldData(): Promise<FieldData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ndvi: parseFloat((Math.random() * 0.8 + 0.1).toFixed(2)),
        predictedYield: 4.5,
        soilMoisture: 64,
        solarExposure: 6.8,
      });
    }, 400);
  });
}
