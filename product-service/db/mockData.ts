import { v4 as uuidv4 } from 'uuid';

export const products = [
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
    price: 48,
  },
  {
    id: uuidv4(),
    title: 'ProductThree',
    description: 'Short ProductThree Description',
    price: 72,
  },
];

export const stocks = [
  {
    product_id: products[0].id,
    count: 100,
  },
  {
    product_id: products[1].id,
    count: 200,
  },
  {
    product_id: products[2].id,
    count: 300,
  },
];
