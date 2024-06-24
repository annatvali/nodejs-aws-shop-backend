import { Product, Stock } from '../types/models';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { headers, generateErrorResponse } from './common';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { title, description, price, count } = JSON.parse(event.body || '{}');

    if (!title || !price || count === undefined) {
      return generateErrorResponse(400, 'Error 400 - Invalid product data!');
    }

    const id = uuidv4();
    const product: Product = { id, title, description, price };
    const stock: Stock = { product_id: id, count };

    const productParams = {
      TableName: process.env.PRODUCTS_TABLE as string,
      Item: marshall(product),
    };
    const stockParams = {
      TableName: process.env.STOCKS_TABLE as string,
      Item: marshall(stock),
    };

    await dynamoDbClient.send(new PutItemCommand(productParams));
    await dynamoDbClient.send(new PutItemCommand(stockParams));

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ ...product, count }),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return generateErrorResponse(500, 'Error 500 - Internal server error!');
  }
};
