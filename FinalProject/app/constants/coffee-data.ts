export interface CoffeeItem {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
  rating: number;
  reviews: string;
  image: string;
}

export const coffeeItems: CoffeeItem[] = [
  { 
    id: '1', 
    name: 'Cappuccino', 
    category: 'Cappuccino', 
    price: '$2.00', 
    image: 'https://png.pngtree.com/png-vector/20250327/ourmid/pngtree-assorted-coffee-cups-including-cappuccino-cup-with-heart-png-image_15878581.png',
    description: 'A classic coffee drink made with equal parts espresso, steamed milk, and milk foam.',
    rating: 4.8,
    reviews: '2.5k'
  },
  { 
    id: '2', 
    name: 'Macchiato', 
    category: 'Macchiato', 
    price: '$2.00', 
    image: 'https://static.vecteezy.com/system/resources/previews/042/654/751/non_2x/ai-generated-layered-latte-macchiato-in-a-clear-glass-free-png.png',
    description: 'Espresso stained with a small amount of foamed milk, perfect for those who like a strong hit.',
    rating: 4.5,
    reviews: '1.8k'
  },
  { 
    id: '3', 
    name: 'Hot coffee', 
    category: 'Hot coffee', 
    price: '$2.00', 
    image: 'https://static.vecteezy.com/system/resources/thumbnails/036/303/390/small/ai-generated-steaming-coffee-cup-hot-beverage-illustration-transparent-background-coffee-mug-clipart-hot-drink-graphic-brewed-coffee-icon-cafe-latte-png.png',
    description: 'Freshly brewed house blend, served piping hot with a smooth, balanced flavor.',
    rating: 4.2,
    reviews: '3.1k'
  },
  { 
    id: '4', 
    name: 'Black Coffee', 
    category: 'Hot coffee', 
    price: '$2.00', 
    image: 'https://file.aiquickdraw.com/imgcompressed/img/compressed_c6632dc4ff0224fc546b2bf5c2bb2a55.webp',
    description: 'Pure, unadulterated coffee brewed to perfection. No milk, no sugar, just caffeine.',
    rating: 4.7,
    reviews: '950'
  },
];