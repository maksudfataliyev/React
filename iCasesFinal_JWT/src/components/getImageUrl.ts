export function getProductImageUrl(imagePath: string): string {
  if (!imagePath) return '';

  if (imagePath.startsWith('http')) return imagePath;

  return new URL(`../assets/images/${imagePath}`, import.meta.url).href;
}
