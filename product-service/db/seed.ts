import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import dynamoDbClient from './config';
import { products, stocks } from './mockData';
import { Product, Stock } from '../types/models';
import dotenv from 'dotenv';

dotenv.config();

const insertProduct = async (product: Product) => {
  const params = {
    TableName: process.env.PRODUCTS_TABLE!,
    Item: marshall(product),
  };
  await dynamoDbClient.send(new PutItemCommand(params));
};

const insertStock = async (stock: Stock) => {
  const params = {
    TableName: process.env.STOCKS_TABLE!,
    Item: marshall(stock),
  };
  await dynamoDbClient.send(new PutItemCommand(params));
};

const seedDatabase = async () => {
  try {
    for (const product of products) {
      await insertProduct(product);
    }

    for (const stock of stocks) {
      await insertStock(stock);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

seedDatabase();
