import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
} from 'aws-lambda';

import * as dotenv from 'dotenv';
dotenv.config();

const UserName = process.env.USER_NAME;
const Password = process.env.PASSWORD;

enum Effect {
  Allow = 'Allow',
  Deny = 'Deny',
}

interface Credentials {
  username: string;
  password: string;
}

const decodeToken = (token: string): Credentials | null => {
  if (!token.startsWith('Basic ')) return null;
  const base64Credentials = token.slice(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString(
    'utf-8'
  );
  const [username, password] = credentials.split(':');
  return { username, password };
};

const generatePolicy = (
  principalId: string,
  effect: Effect,
  statusCode: number
): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: '*',
        },
      ],
    },
    context: {
      statusCode: statusCode.toString(),
    },
  };
};

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  console.log('Event', JSON.stringify(event));

  const token = event.authorizationToken;

  if (!token || !token.startsWith('Basic ')) {
    return generatePolicy('unauthorized', Effect.Deny, 401);
  }

  const credentials = decodeToken(token);

  if (
    !credentials ||
    credentials.username !== UserName ||
    credentials.password !== Password
  ) {
    return generatePolicy('unauthorized', Effect.Deny, 403);
  }

  return generatePolicy(credentials.username, Effect.Allow, 200);
};