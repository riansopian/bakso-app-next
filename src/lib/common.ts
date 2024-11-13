/**
 * Estimate duration based on distance and driving mode.
 * @param distanceKm - The distance in kilometers.
 * @param mode - The driving mode ('foot', 'car', 'bike', 'motorcycle').
 * @returns The estimated duration in minutes.
 */
export function estimateDuration(distanceKm: number, mode: 'foot' | 'car' | 'bike' | 'motorcycle'): number {
  let speedKmh: number;

  switch (mode) {
    case 'foot':
      speedKmh = 5;
      break;
    case 'car':
      speedKmh = 60;
      break;
    case 'bike':
      speedKmh = 20;
      break;
    case 'motorcycle':
      speedKmh = 45;
      break;
    default:
      throw new Error(`Unknown mode: ${mode}`);
  }


  const durationHours = distanceKm / speedKmh;
  const durationMinutes = durationHours * 60;

  return durationMinutes;
}
