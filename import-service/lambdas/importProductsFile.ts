import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucketName = process.env.S3_IMPORT_BUCKET;
if (!bucketName) {
  console.error('S3_IMPORT_BUCKET environment variable is not set.');
  throw new Error('S3_IMPORT_BUCKET environment variable is not set.');
}

const s3Client = new S3({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name;
  const operation = event.queryStringParameters?.operation || 'download';

  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'File name is required in the query string parameter "name".',
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  let s3ActionRequest;
  if (operation === 'download') {
    s3ActionRequest = new GetObjectCommand({
      Bucket: bucketName,
      Key: `uploaded/${fileName}`,
    });
  } else if (operation === 'upload') {
    s3ActionRequest = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploaded/${fileName}`,
    });
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Invalid operation specified. Use "download" or "upload".',
      }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  try {
    const signedUrl = await getSignedUrl(s3Client, s3ActionRequest, {
      expiresIn: 3600,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl, operation }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};
