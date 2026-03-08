/** Pest hatching window prediction engine using weather + NDVI data */

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  rainfall: number;
}

export interface PestProfile {
  id: string;
  name: string;
  scientificName: string;
  tempRange: [number, number]; // °C optimal hatching range
  humidityThreshold: number;   // % minimum humidity for hatching
  ndviPreference: 'high' | 'moderate' | 'low'; // vegetation density preference
  incubationDays: number;
  riskCrops: string[];
  icon: string;
}

export interface HatchingPrediction {
  pest: PestProfile;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  riskScore: number; // 0-100
  estimatedWindow: { start: string; end: string };
  triggers: string[];
}

// Common agricultural pests in South/Southeast Asian context
export const PEST_PROFILES: PestProfile[] = [
  {
    id: 'fall-armyworm',
    name: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    tempRange: [25, 35],
    humidityThreshold: 65,
    ndviPreference: 'high',
    incubationDays: 3,
    riskCrops: ['Maize', 'Rice', 'Sugarcane'],
    icon: '🐛',
  },
  {
    id: 'brown-planthopper',
    name: 'Brown Planthopper',
    scientificName: 'Nilaparvata lugens',
    tempRange: [22, 30],
    humidityThreshold: 70,
    ndviPreference: 'high',
    incubationDays: 7,
    riskCrops: ['Rice', 'Wheat'],
    icon: '🦗',
  },
  {
    id: 'stem-borer',
    name: 'Yellow Stem Borer',
    scientificName: 'Scirpophaga incertulas',
    tempRange: [26, 34],
    humidityThreshold: 75,
    ndviPreference: 'moderate',
    incubationDays: 5,
    riskCrops: ['Rice'],
    icon: '🪲',
  },
  {
    id: 'whitefly',
    name: 'Whitefly',
    scientificName: 'Bemisia tabaci',
    tempRange: [20, 32],
    humidityThreshold: 55,
    ndviPreference: 'moderate',
    incubationDays: 4,
    riskCrops: ['Cotton', 'Tomato', 'Soybean'],
    icon: '🦟',
  },
];

// Simulated 14-day weather forecast
export function generateMockWeather(): WeatherDay[] {
  const days: WeatherDay[] = [];
  const now = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    
    // Simulate monsoon-like patterns with humidity spikes
    const baseTemp = 28 + Math.sin(i * 0.5) * 4;
    const humiditySpike = i >= 3 && i <= 7; // humidity spike window
    
    days.push({
      date: d.toISOString().split('T')[0],
      tempMax: parseFloat((baseTemp + Math.random() * 3).toFixed(1)),
      tempMin: parseFloat((baseTemp - 6 + Math.random() * 2).toFixed(1)),
      humidity: humiditySpike
        ? Math.round(72 + Math.random() * 20)
        : Math.round(45 + Math.random() * 25),
      rainfall: humiditySpike
        ? parseFloat((Math.random() * 15).toFixed(1))
        : parseFloat((Math.random() * 3).toFixed(1)),
    });
  }
  return days;
}

export function predictHatchingWindows(
  weather: WeatherDay[],
  ndvi: number,
): HatchingPrediction[] {
  const ndviCategory = ndvi >= 0.6 ? 'high' : ndvi >= 0.35 ? 'moderate' : 'low';

  return PEST_PROFILES.map((pest) => {
    let score = 0;
    const triggers: string[] = [];

    // Temperature scoring
    const avgTemp = weather.reduce((s, d) => s + (d.tempMax + d.tempMin) / 2, 0) / weather.length;
    if (avgTemp >= pest.tempRange[0] && avgTemp <= pest.tempRange[1]) {
      score += 30;
      triggers.push(`Avg temp ${avgTemp.toFixed(1)}°C in optimal range`);
    } else if (Math.abs(avgTemp - (pest.tempRange[0] + pest.tempRange[1]) / 2) < 5) {
      score += 15;
    }

    // Humidity scoring — look for consecutive high-humidity days
    const highHumidityDays = weather.filter((d) => d.humidity >= pest.humidityThreshold);
    const humRatio = highHumidityDays.length / weather.length;
    if (humRatio > 0.5) {
      score += 30;
      triggers.push(`${highHumidityDays.length} days with humidity ≥${pest.humidityThreshold}%`);
    } else if (humRatio > 0.25) {
      score += 15;
      triggers.push(`${highHumidityDays.length} moderate-humidity days detected`);
    }

    // NDVI scoring
    if (ndviCategory === pest.ndviPreference) {
      score += 25;
      triggers.push(`NDVI ${ndvi.toFixed(2)} matches ${pest.ndviPreference} vegetation preference`);
    } else if (
      (ndviCategory === 'high' && pest.ndviPreference === 'moderate') ||
      (ndviCategory === 'moderate' && pest.ndviPreference === 'high')
    ) {
      score += 12;
    }

    // Rainfall boost
    const totalRain = weather.reduce((s, d) => s + d.rainfall, 0);
    if (totalRain > 30) {
      score += 15;
      triggers.push(`${totalRain.toFixed(0)}mm rainfall increases breeding habitat`);
    }

    score = Math.min(score, 100);

    // Estimate window
    const spikeStart = weather.findIndex((d) => d.humidity >= pest.humidityThreshold);
    const startIdx = spikeStart >= 0 ? spikeStart : 3;
    const startDate = weather[startIdx]?.date || weather[0].date;
    const endDate = weather[Math.min(startIdx + pest.incubationDays + 3, weather.length - 1)]?.date || weather[weather.length - 1].date;

    const riskLevel: HatchingPrediction['riskLevel'] =
      score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 30 ? 'moderate' : 'low';

    return {
      pest,
      riskLevel,
      riskScore: score,
      estimatedWindow: { start: startDate, end: endDate },
      triggers,
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
}
