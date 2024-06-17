import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { handler } from '../lambdas/getProductsList';
import * as data from '../lambdas/data.json';
import * as fs from 'fs';

jest.mock('fs');

describe('getProductsList handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(data));
  });

  it('should return a 200 status code with products list', async () => {
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(200);
    expect(result.body).toEqual(JSON.stringify(data));
  });


  it('should return a 404 error if no products are found', async () => {
    (fs.readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([]));
    const event: APIGatewayProxyEvent = {} as APIGatewayProxyEvent;
    const context: Context = {} as Context;
    const result = (await handler(
      event,
      context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toBe(404);
    expect(result.body).toContain('Error 404 - Products not found!');
  });
});
