import {
  APIGatewayProxyEvent,
  Context,
  Callback,
  APIGatewayProxyResult,
} from 'aws-lambda';
import { handler } from '../lambdas/getProductById';
import { Product } from '../types/models';
import { generateErrorResponse, headers } from '../lambdas/common';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDBClient: jest.fn(() => ({
      send: jest.fn(),
    })),
    GetItemCommand: jest.fn(),
  };
});

describe('getProductById Lambda Function', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      title: 'ProductOne',
      price: 24,
      description: 'Short productOne description',
    },
  ];

  const mockContext: Context = {} as Context;
  const mockCallback: Callback = jest.fn();

  beforeEach(() => {
    (path.resolve as jest.Mock).mockReturnValue('mock/data.json');
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify(mockProducts)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the requested product', async () => {
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '1' },
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult;

    const expectedResponse = {
      statusCode: 200,
      headers,
      body: JSON.stringify(mockProducts[0]),
    };
    expect(result.statusCode).toBe(expectedResponse.statusCode);
    expect(result.body).toEqual(expectedResponse.body);
  });

  it('should return 404 when the requested product is not found', async () => {
    (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([]));
    const event: APIGatewayProxyEvent = {
      pathParameters: { id: '999' },
    } as unknown as APIGatewayProxyEvent;
    const result = (await handler(
      event,
      mockContext,
      mockCallback
    )) as APIGatewayProxyResult;

    const expectedResponse = generateErrorResponse(
      404,
      'Error 404 - Product not found!'
    );
    expect(result.statusCode).toBe(expectedResponse.statusCode);
    expect(result.body).toContain(expectedResponse.body);
  });

});
