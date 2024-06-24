import { Product, Stock } from '../types/models';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { headers, generateErrorResponse } from './common';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const convertDynamoDBItem = <T>(
  item: AWS.DynamoDB.DocumentClient.AttributeMap
): T => {
  return Object.keys(item).reduce((acc: any, key) => {
    const value = item[key];
    if (typeof value === 'object' && value !== null) {
      if ('S' in value) {
        acc[key] = value.S;
      } else if ('N' in value) {
        acc[key] = Number(value.N);
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {}) as T;
};

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

    // const products = productsResult.Items ?? [];
    // const stocks = stocksResult.Items ?? [];
    const products =
      productsResult.Items?.map((item) => convertDynamoDBItem<Product>(item)) ??
      [];
    const stocks =
      stocksResult.Items?.map((item) => convertDynamoDBItem<Stock>(item)) ?? [];

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
