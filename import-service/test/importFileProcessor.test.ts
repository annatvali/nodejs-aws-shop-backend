import { handler } from '../lambdas/importFileProcessor';
import { S3Event } from 'aws-lambda';
import { GetObjectCommand, S3 } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { Readable } from 'stream';

const s3Mock = mockClient(S3);

beforeEach(() => {
  s3Mock.reset();
  jest.clearAllMocks();
});

describe('importFileProcessor', () => {
  it('processes file from S3 event', async () => {
    const s3Event: S3Event = {
      Records: [
        {
          eventVersion: '2.1',
          eventSource: 'aws:s3',
          awsRegion: 'us-east-1',
          eventTime: '2022-01-01T00:00:00.000Z',
          eventName: 'ObjectCreated:Put',
          userIdentity: {
            principalId: 'EXAMPLE',
          },
          requestParameters: {
            sourceIPAddress: '127.0.0.1',
          },
          responseElements: {
            'x-amz-request-id': 'EXAMPLE123456789',
            'x-amz-id-2': 'EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH',
          },
          s3: {
            s3SchemaVersion: '1.0',
            configurationId: 'testConfig',
            bucket: {
              name: 'test-bucket',
              ownerIdentity: {
                principalId: 'EXAMPLE',
              },
              arn: 'arn:aws:s3:::example-bucket',
            },
            object: {
              key: 'uploaded/test-file.csv',
              size: 1234,
              eTag: '0123456789abcdef0123456789abcdef',
              sequencer: '0A1B2C3D4E5F678901',
            },
          },
        },
      ],
    };

  s3Mock.on(GetObjectCommand).resolves({
    Body: Readable.from([
      'ProductID,ProductName,Price\n1,"Laptop",999.99\n2,"Smartphone",599.99',
    ]) as any,
  });
    const logSpy = jest.spyOn(console, 'log');

    await handler(s3Event);
    expect(s3Mock.calls()).toHaveLength(1);
    expect(logSpy).toHaveBeenCalledWith(
      'ProductID,ProductName,Price\n1,"Laptop",999.99\n2,"Smartphone",599.99'
    );
  });
});
