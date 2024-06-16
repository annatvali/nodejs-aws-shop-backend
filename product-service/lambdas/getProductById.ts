import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { Product } from '../interfaces/Product';
import { headers, generateErrorResponse } from './common';
import * as fs from 'fs';
import * as path from 'path';

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return generateErrorResponse(400, 'Error 400 - Missing product ID!');
    }

    const dataPath = path.resolve(__dirname, 'data.json');
    const products: Product[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const product = products.find((product: Product) => product.id === id);

    if (!product) {
      return generateErrorResponse(404, 'Error 404 - Product not found!');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return generateErrorResponse(500, 'Error 500 - Internal server error!');
  }
};
