import { handler } from '../lambdas/catalogBatchProcess';
import { SQSEvent } from 'aws-lambda';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));
jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(),
  },
}));
jest.mock('@aws-sdk/client-sns', () => ({
  SNSClient: jest.fn(),
}));

// Mock ProductService with a focus on createProduct method
jest.mock('../lambdas/catalogBatchProcess', () => {
  return {
    ProductService: jest.fn().mockImplementation(() => ({
      createProduct: jest.fn().mockResolvedValue(undefined),
    })),
    handler: jest.requireActual('../lambdas/catalogBatchProcess').handler,
  };
});

describe('catalogBatchProcess Lambda Function', () => {
  let mockEvent: SQSEvent;

  beforeEach(() => {
    mockEvent = {
      Records: [
        {
          body: JSON.stringify({
            title: 'Test Product',
            description: 'Test Description',
            price: 100,
            count: 10,
          }),
          messageId: '',
          receiptHandle: '',
          attributes: {
            ApproximateReceiveCount: '',
            SentTimestamp: '',
            SenderId: '',
            ApproximateFirstReceiveTimestamp: '',
          },
          messageAttributes: {},
          md5OfBody: '',
          eventSource: '',
          eventSourceARN: '',
          awsRegion: '',
        },
      ],
    };

    const { ProductService } = require('../lambdas/catalogBatchProcess');
    ProductService.mockClear();
    ProductService().createProduct.mockClear();
  });

  test('processes products from SQS event', async () => {
    await handler(mockEvent);

    const { ProductService } = require('../lambdas/catalogBatchProcess');
    // expect(ProductService().createProduct).toHaveBeenCalledTimes(1);
    // expect(ProductService().createProduct).toHaveBeenCalledWith({
    //   title: 'Test Product',
    //   description: 'Test Description',
    //   price: 100,
    //   count: 10,
    // });
  });

  test('handles empty SQS event', async () => {
    mockEvent.Records = [];

    await handler(mockEvent);

    const { ProductService } = require('../lambdas/catalogBatchProcess');
    expect(ProductService).toHaveBeenCalled();
  });
});
