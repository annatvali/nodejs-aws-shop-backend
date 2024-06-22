import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

if (!process.env.PRODUCTS_TABLE || !process.env.STOCKS_TABLE) {
  throw new Error(
    'Environment variables PRODUCTS_TABLE and STOCKS_TABLE must be defined'
  );
}

export default dynamoDbClient;