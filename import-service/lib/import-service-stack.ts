import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, s3ImportBucket: string) {
    super(scope, id, {});

    const importProductsFileLambda = new lambda.Function(
      this,
      'ImportProductsFile',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'importProductsFile.handler',
        code: lambda.Code.fromAsset('lambdas'),
        environment: {
          S3_IMPORT_BUCKET: s3ImportBucket,
        },
      }
    );

    importProductsFileLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [`arn:aws:s3:::${s3ImportBucket}/uploaded/*`],
      })
    );

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'ImportService',
    });

    const importResource = api.root.addResource('import');
    importResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(importProductsFileLambda),
      {
        requestParameters: {
          'method.request.querystring.name': true,
        },
      }
    );

    new cdk.CfnOutput(this, 'ImportApiUrl', {
      value: api.url,
    });
  }
}
