import { APIGatewayProxyHandler } from 'aws-lambda';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucketName = process.env.S3_IMPORT_BUCKET;
if (!bucketName) {
  console.error('S3_IMPORT_BUCKET environment variable is not set.');
  throw new Error('S3_IMPORT_BUCKET environment variable is not set.');
}

const s3Client = new S3({ region: process.env.AWS_REGION || 'us-east-1' });

export const handler: APIGatewayProxyHandler = async (event) => {
  const fileName = event.queryStringParameters?.name;
  if (!fileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'File name is required in the query string parameter "name".',
      }),
      handlers: {
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: `uploaded/${fileName}`,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl }),
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
