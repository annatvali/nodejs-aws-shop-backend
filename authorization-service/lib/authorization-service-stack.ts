import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dotenv from 'dotenv';

dotenv.config();
export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      const USER_NAME = process.env.USER_NAME as string;
      const PASSWORD = process.env.PASSWORD as string;

    const basicAuthorizer = new lambda.Function(this, 'BasicAuthorizer', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'basicAuthorizer.handler',
      code: lambda.Code.fromAsset('lambdas'),
      environment: {
        USER_NAME:  USER_NAME,
        PASSWORD: PASSWORD,
      },
    });
  }
}
