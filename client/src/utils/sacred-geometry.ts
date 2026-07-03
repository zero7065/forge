export function generateFlowerOfLife(size: number = 200): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 6;
  const circles: string[] = [];

  // Center circle
  circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>`);

  // First ring - 6 circles
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>`);
  }

  // Second ring - 6 circles at larger radius
  const r2 = r * 1.732;
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 + 30) * Math.PI / 180;
    const x = cx + r2 * Math.cos(angle);
    const y = cy + r2 * Math.sin(angle);
    circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.15"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${circles.join('')}</svg>`;
}

export function generateSeedOfLife(size: number = 200): string {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 5;
  const circles: string[] = [];

  circles.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>`);

  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    circles.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.25"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${circles.join('')}</svg>`;
}

export const GOLDEN_RATIO = 1.618033988749895;
