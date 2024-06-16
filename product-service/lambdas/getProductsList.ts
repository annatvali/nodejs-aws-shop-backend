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
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const dataPath = path.resolve(__dirname, 'data.json');
    const products: Product[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    if (!products || products.length === 0) {
      return generateErrorResponse(404, 'Error 404 - Products not found!');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return generateErrorResponse(500, 'Error 500 - Internal server error!');
  }
};
