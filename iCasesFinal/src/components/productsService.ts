const API_URL = 'http://localhost:5146/api/products';
export interface Product {
  id: string;
  title: string;
  price: number;
  designer: string;
  color: string;
  image: string;
  category: string;
  discount: number | null;
  ram?: number;
  storage?: number;
  year?: number;
  processor?: string;
  camera?: string;
  operatingSystem?: string;
  designedFor?: string;
  type?: string;
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export function getProductImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) return imagePath;
  return new URL(`../assets/images/${imagePath}`, import.meta.url).href;
}
