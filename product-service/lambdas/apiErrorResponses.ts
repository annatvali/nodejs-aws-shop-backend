import { APIGatewayProxyResult } from 'aws-lambda';
import { headers } from './common';

const ErrorKeyResourceNotFound = 'ErrorKeyResourceNotFound';
const ErrorKeyInvalidRequest = 'ErrorKeyInvalidRequest';
const ErrorKeyServerError = 'ErrorKeyServerError';

const responseMap: Record<string, { code: number; description: string }> = {
  [ErrorKeyResourceNotFound]: { code: 404, description: 'Resource not found' },
  [ErrorKeyInvalidRequest]: { code: 400, description: 'Invalid request' },
  [ErrorKeyServerError]: {
    code: 500,
    description: 'Internal server error occurred',
  },
};

export const processError = (
  errorIdentifier: string
): APIGatewayProxyResult => {
  const { code, description } =
    responseMap[errorIdentifier] || responseMap[ErrorKeyServerError];
  return {
    statusCode: code,
    headers,
    body: JSON.stringify({ message: description }),
  };
};
