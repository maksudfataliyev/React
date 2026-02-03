export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  id: string;
  date: string;
  status: "Completed" | "Processing" | "Cancelled";
  products: Product[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  image: string;
}

export const ORDER_HISTORY: OrderItem[] = [
  {
    id: "ORD-7721",
    date: "Oct 24, 2025",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=200&auto=format&fit=crop",
    subtotal: 10.50,
    deliveryFee: 2.00,
    total: 12.50,
    products: [
      { id: "p1", name: "Caramel Macchiato", quantity: 1, price: 5.50 },
      { id: "p2", name: "Blueberry Muffin", quantity: 1, price: 5.00 },
    ],
  },
  {
    id: "ORD-8812",
    date: "Oct 20, 2025",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=200&auto=format&fit=crop",
    subtotal: 4.80,
    deliveryFee: 1.50,
    total: 6.30,
    products: [
      { id: "p3", name: "Iced Vanilla Latte", quantity: 1, price: 4.80 },
    ],
  }
];