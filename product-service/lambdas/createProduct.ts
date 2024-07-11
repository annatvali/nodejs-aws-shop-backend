import { headers } from './common';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { processError } from './apiErrorResponses';
import { ProductRequestData } from '../types/models';

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(dynamodbClient);

const PRODUCT_TABLE = process.env.PRODUCT_TABLE;
const STOCK_TABLE = process.env.STOCK_TABLE;

async function validateRequest(body: any): Promise<ProductRequestData> {
  const { title, description, price, count = 0 } = body;
  if (!title || !description || !price) {
    throw new Error('ErrorKeyInvalidRequest');
  }
  return { title, description, price, count };
}

async function createProductInDatabase(product: ProductRequestData) {
  const id: string = uuidv4();
  const productParams = {
    TableName: PRODUCT_TABLE,
    Item: { id, ...product },
  };

  const stockParams = {
    TableName: STOCK_TABLE,
    Item: { product_id: id, count: product.count },
  };

  const transactionParams = {
    TransactItems: [{ Put: productParams }, { Put: stockParams }],
  };

  await dynamodb.send(new TransactWriteCommand(transactionParams));
  return id;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Initiating request processing:', event);

  try {
    const body: ProductRequestData = JSON.parse(event.body || '{}');
    const validatedProduct = await validateRequest(body);
    console.log('Validation passed, proceeding with product creation!');

    const productId = await createProductInDatabase(validatedProduct);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Product successfully added to the catalog',
        productId,
      }),
    };
  } catch (e: any) {
    console.error('Failed to create product due to an error:', e.message);
    return processError(e.message);
  }
};
