import { Product, Stock } from '../types/models';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { headers, generateErrorResponse } from './common';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

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
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return generateErrorResponse(400, 'Error 400 - Missing product ID!');
    }

    const productsTable = process.env.PRODUCTS_TABLE!;
    const stocksTable = process.env.STOCKS_TABLE!;

    const getProductParams = {
      TableName: productsTable,
      Key: marshall({ id }),
    };
    const getStockParams = {
      TableName: stocksTable,
      Key: marshall({ product_id: id }),
    };

    const productResult = await dynamoDbClient.send(
      new GetItemCommand(getProductParams)
    );
    // const product = productResult.Item ? productResult.Item : undefined;
    const product = productResult.Item
      ? convertDynamoDBItem<Product>(productResult.Item)
      : undefined;

    if (!product) {
      return generateErrorResponse(404, 'Error 404 - Product not found!');
    }

    const stockResult = await dynamoDbClient.send(
      new GetItemCommand(getStockParams)
    );
    // const stock = stockResult.Item ? stockResult.Item : undefined;
    const stock = stockResult.Item
      ? convertDynamoDBItem<Stock>(stockResult.Item)
      : undefined;

    const productWithStock = {
      ...product,
      count: stock ? stock.count : 0,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productWithStock),
    };
  } catch (error) {
    console.error('Error handling request:', error);
    return generateErrorResponse(500, 'Error 500 - Internal server error!');
  }
};
