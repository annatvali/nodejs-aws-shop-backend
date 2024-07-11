process.env.S3_IMPORT_BUCKET = 'test-bucket';

import { handler } from '../lambdas/importProductsFile';
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from 'aws-lambda';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('mockSignedUrl'),
}));

afterAll(() => {
  delete process.env.S3_IMPORT_BUCKET;
});

describe('importProductsFile', () => {
  it('returns signed URL for the provided file name', async () => {
    const event: APIGatewayProxyEvent = {
      queryStringParameters: {
        name: 'test-file.csv',
      },
    } as any;

    const context: Context = {} as any;

    const result = (await handler(
      event,
      context,
      () => {}
    )) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toEqual({ url: 'mockSignedUrl' });
  });
});
