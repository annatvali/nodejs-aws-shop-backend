import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler,
} from 'aws-lambda';
import { headers, generateErrorResponse } from './common';
import dynamoDbClient from '../db/config';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

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
      Key: marshall({ id }), // Marshall the Key object
    };
    const getStockParams = {
      TableName: stocksTable,
      Key: marshall({ product_id: id }), // Marshall the Key object
    };

    const productResult = await dynamoDbClient.send(
      new GetItemCommand(getProductParams)
    );
    const product = productResult.Item ? productResult.Item : undefined;

    if (!product) {
      return generateErrorResponse(404, 'Error 404 - Product not found!');
    }

    const stockResult = await dynamoDbClient.send(
      new GetItemCommand(getStockParams)
    );
    const stock = stockResult.Item ? stockResult.Item : undefined;

    const productWithStock = {
      ...product,
      count: stock ? stock.count.N : 0, // Access the count attribute from DynamoDB response
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
