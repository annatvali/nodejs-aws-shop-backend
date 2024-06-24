import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { headers, generateErrorResponse } from './common';
// import dynamoDbClient from '../db/config';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const productsTable = process.env.PRODUCTS_TABLE!;
    const stocksTable = process.env.STOCKS_TABLE!;

    const productsResult = await dynamoDbClient.send(
      new ScanCommand({ TableName: productsTable })
    );
    const stocksResult = await dynamoDbClient.send(
      new ScanCommand({ TableName: stocksTable })
    );

    const products = productsResult.Items ?? [];
    const stocks = stocksResult.Items ?? [];

    const productsWithStock = products.map((product) => {
      const stock = stocks.find((s) => s.product_id === product.id);
      return {
        ...product,
        count: stock ? stock.count : 0,
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productsWithStock),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return generateErrorResponse(500, 'Error 500 - Internal server error!');
  }
};
