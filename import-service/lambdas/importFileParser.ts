import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Readable } from 'stream';
import csvParser from 'csv-parser';

type ProductInventory = {
  title: string;
  description: string;
  price: number;
  count: number;
};

export const handler = async (event: S3Event) => {
  const s3Client = new S3Client({});
  const sqsClient = new SQSClient({});

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const { Body } = await s3Client.send(getCommand);

      if (!Body) throw new Error('Body is undefined');

      const readableStream = Body as Readable;

      await new Promise<void>((resolve, reject) => {
        readableStream
          .pipe(csvParser())
          .on('data', async (data) => {
            try {
              const msgCommand = new SendMessageCommand({
                QueueUrl: process.env.SQS_URL,
                MessageBody: JSON.stringify(data),
              });
              await sqsClient.send(msgCommand);
            } catch (error) {
              console.error('Error sending message to SQS:', error);
              reject(error);
            }
          })
          .on('end', () => {
            console.log('CSV processing completed.');
            resolve();
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            reject(error);
          });
      });

      const newKey = key.replace('uploaded', 'parsed');
      const copyCommand = new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: newKey,
      });
      await s3Client.send(copyCommand);
      console.log('File copied from uploaded to parsed:', newKey);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      await s3Client.send(deleteCommand);
      console.log(`Object ${key} was successfully moved to parsed folder`);
    } catch (error) {
      console.error(
        `Error processing file ${key} from bucket ${bucket}:`,
        error
      );
    }
  }
};