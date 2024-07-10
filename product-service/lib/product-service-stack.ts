import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as dotenv from 'dotenv';

dotenv.config();
export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTableArn =
      process.env.PRODUCTS_TABLE_ARN ||
      'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/products';
    const stocksTableArn =
      process.env.STOCKS_TABLE_ARN ||
      'arn:aws:dynamodb:REGION:ACCOUNT_ID:table/stocks';

    const productsTableName = process.env.PRODUCTS_TABLE as string
    const stocksTableName = process.env.STOCKS_TABLE as string;

    const productsTable = dynamodb.Table.fromTableName(
      this,
      'ProductsTable',
      productsTableName
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'StocksTable',
      stocksTableName
    );

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
       queueName: 'catalogItemsQueue',
    });

    const catalogBatchProcessFunction = new lambda.Function(
      this,
      'catalogBatchProcessFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'catalogBatchProcess.handler',
        environment: {
          SQS_URL: catalogItemsQueue.queueUrl,
          PRODUCTS_TABLE_NAME: productsTable.tableName,
        },
      }
    );

    catalogBatchProcessFunction.addEventSource(
      new SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );

    const getProductsListFunction = new lambda.Function(
      this,
      'GetProductsListHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambdas'),
        handler: 'getProductsList.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    const getProductByIdFunction = new lambda.Function(
      this,
      'GetProductByIdHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambdas'),
        handler: 'getProductById.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    const createProductFunction = new lambda.Function(
      this,
      'CreateProductHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambdas'),
        handler: 'createProduct.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    const updateProductFunction = new lambda.Function(
      this,
      'UpdateProductHandler',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('lambdas'),
        handler: 'updateProduct.handler',
        environment: {
          PRODUCTS_TABLE: productsTable.tableName,
          STOCKS_TABLE: stocksTable.tableName,
        },
      }
    );

    productsTable.grantReadWriteData(getProductsListFunction);
    stocksTable.grantReadWriteData(getProductsListFunction);

    productsTable.grantReadWriteData(getProductByIdFunction);
    stocksTable.grantReadWriteData(getProductByIdFunction);

    productsTable.grantReadWriteData(createProductFunction);
    stocksTable.grantReadWriteData(createProductFunction);

    productsTable.grantReadWriteData(updateProductFunction);
    stocksTable.grantReadWriteData(updateProductFunction);

    catalogItemsQueue.grantConsumeMessages(catalogBatchProcessFunction);
    productsTable.grantReadWriteData(catalogBatchProcessFunction);

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
      description: 'This service serves products',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const allProductsResource = api.root.addResource('products');
    allProductsResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsListFunction)
    );

    allProductsResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(createProductFunction)
    );

    const singleProductResource = allProductsResource.addResource('{id}');
    singleProductResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductByIdFunction)
    );

    singleProductResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(updateProductFunction)
    );
  }
}
