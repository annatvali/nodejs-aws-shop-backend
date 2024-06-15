import { v4 as uuidv4 } from 'uuid';
import { Product } from '../interfaces/Product';

export const products: Product[] = [
  {
    id: uuidv4(),
    title: 'ProductOne',
    description: 'Short ProductOne Description',
    price: 24,
  },
  {
    id: uuidv4(),
    title: 'ProductTwo',
    description: 'Short ProductTwo Description',
    price: 11,
  },
  {
    id: uuidv4(),
    title: 'ProductThree',
    description: 'Short ProductThree Description',
    price: 23,
  },
  {
    id: uuidv4(),
    title: 'ProductFour',
    description: 'Short ProductFour Description',
    price: 15,
  },
  {
    id: uuidv4(),
    title: 'ProductFive',
    description: 'Short ProductFive Description',
    price: 28,
  },
  {
    id: uuidv4(),
    title: 'ProductSix',
    description: 'Short ProductSix Description',
    price: 17,
  },
];
