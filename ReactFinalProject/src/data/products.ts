import img1 from '../assets/images/img1.png';
import img2 from '../assets/images/img2.png';
import img3 from '../assets/images/img3.png';
import img4 from '../assets/images/img4.png';
import img5 from '../assets/images/img5.png';
import img6 from '../assets/images/img6.png';
import img7 from '../assets/images/img7.png';
import img8 from '../assets/images/img8.png';
import img9 from '../assets/images/img9.png';
import img10 from '../assets/images/img10.png';
import img11 from '../assets/images/img11.png';
import img12 from '../assets/images/img12.png';

export interface Phone {
  id: string;
  title: string;
  price: number;
  ram: number;
  storage: number;
  year: number;
  image: string;
  processor: string;
  camera: string;
  operating_system: string;
  color: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  category: 'phones'
}

export interface Case {
  id: string;
  title: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  designed_for: string;
  color: string;
  image: string;
  price: number;
  category: 'cases'

}

export interface Headphone {
  id: string;
  title: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  color: string;
  image: string;
  price: number;
  category: 'headphones'

}

export interface Cable {
  id: string;
  title: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  type: 'USB Type-A' | 'USB Type-Ab' | 'USB Mini-B' | 'USB Micro-B' | 'USB Type-C' | 'Lightning';
  color: string;
  image: string;
  price: number;
  category: 'cables'
}

export interface Watch {
  id: string;
  title: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  color: string;
  image: string;
  price: number;
  category: 'watches'
}

export interface Earbuds {
  id: string;
  title: string;
  designer: 'Apple' | 'Samsung' | 'Xiaomi';
  color: string;
  image: string;
  price: number;
  category: 'earbuds'
}

export const phones: Phone[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max (256 GB) - Natural Titanium',
    price: 999.99,
    ram: 6,
    storage: 256,
    year: 2023,
    image: img1,
    processor: 'A17 Pro',
    camera: 'Triple 12MP',
    operating_system: 'iOS',
    color: 'Natural Titanium',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '2',
    title: 'iPhone 13 (128GB) - Midnight',
    price: 399.99,
    ram: 4,
    storage: 128,
    year: 2021,
    image: img2,
    processor: 'A15 Bionic',
    camera: 'Dual 12MP',
    operating_system: 'iOS',
    color: 'Midnight',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '3',
    title: 'iPhone 15 (128GB) - Blue',
    price: 699.99,
    ram: 6,
    storage: 128,
    year: 2023,
    image: img3,
    processor: 'A16 Bionic',
    camera: 'Dual 12MP',
    operating_system: 'iOS',
    color: 'Blue',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '4',
    title: 'iPhone 15 (128GB) - Black',
    price: 699.99,
    ram: 6,
    storage: 128,
    year: 2023,
    image: img4,
    processor: 'A16 Bionic',
    camera: 'Dual 12MP',
    operating_system: 'iOS',
    color: 'Black',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '5',
    title: 'iPhone 12 (128GB) - Green',
    price: 299.99,
    ram: 4,
    storage: 128,
    year: 2020,
    image: img5,
    processor: 'A14 Bionic',
    camera: 'Dual 12MP',
    operating_system: 'iOS',
    color: 'Green',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '6',
    title: 'iPhone 14 (128GB) - Starlight',
    price: 499.99,
    ram: 6,
    storage: 128,
    year: 2022,
    image: img6,
    processor: 'A15 Bionic',
    camera: 'Dual 12MP',
    operating_system: 'iOS',
    color: 'Starlight',
    designer: 'Apple',
    category: 'phones'
  },
  {
    id: '9',
    title: 'iPhone 16 Pro Max (256GB) - Desert Titanium',
    price: 1499.99,
    ram: 8,
    storage: 256,
    year: 2024,
    image: img9,
    processor: 'A18 Pro',
    camera: 'Triple 12MP',
    operating_system: 'iOS',
    color: 'Desert Titanium',
    designer: 'Apple',
    category: 'phones'
  }
];

export const earbuds: Earbuds[] = [
  {
    id: '7',
    title: 'Apple AirPods 2',
    price: 99.99,
    image: img7,
    color: 'White',
    designer: 'Apple',
    category: 'earbuds'
  }
];

export const watches: Watch[] = [
  {
    id: '8',
    title: 'Galaxy Watch Ultra (LTE, 47mm) - Titanium Gray',
    price: 599.99,
    image: img8,
    color: 'Titanium Gray',
    designer: 'Samsung',
    category: 'watches'
  }
];

export const cases: Case[] = [
  {
    id: '10',
    title: 'iPhone 15 Clear Case with MagSafe',
    designer: 'Apple',
    designed_for: 'iPhone 15',
    color: 'Transparent',
    image: img10,
    price: 50,
    category: 'cases'
  }
];
export const headphones: Headphone[] = [
  {
    id: '11',
    title: 'AirPods Max - Purple',
    designer: 'Apple',
    color: 'Purple',
    image: img11,
    price: 549.99,
    category: 'headphones'
  }
];
export const cables: Cable[] = [
  {
    id: '12',
    title: 'Apple Lightning to USB Cable (1 m)',
    designer: 'Apple',
    type: 'Lightning',
    color: 'white',
    image: img12,
    price: 10,
    category: 'cables'
  }
  
];

export default {
  phones,
  earbuds,
  watches,
  cases,
  headphones,
  cables
};
