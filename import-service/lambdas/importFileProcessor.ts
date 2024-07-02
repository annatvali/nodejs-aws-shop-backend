import { S3Event } from 'aws-lambda';
import { S3 } from '@aws-sdk/client-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { text } from 'stream/consumers';

const s3Client = new S3();

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    try {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const { Body } = await s3Client.send(command);

      if (Body) {
        const readableBody = Body as Readable;
        const content = await text(readableBody);
        console.log(content);
      }
    } catch (error) {
      console.error(
        `Error processing file ${key} from bucket ${bucket}:`,
        error
      );
    }
  }
};