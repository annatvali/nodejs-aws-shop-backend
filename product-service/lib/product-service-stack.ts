import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = new dynamodb.Table(this, 'ProductsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'products',
    });

    const stocksTable = new dynamodb.Table(this, 'StocksTable', {
      partitionKey: {
        name: 'product_id',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'stocks',
    });

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

    productsTable.grantReadData(getProductsListFunction);
    stocksTable.grantReadData(getProductsListFunction);

    productsTable.grantReadData(getProductByIdFunction);
    stocksTable.grantReadData(getProductByIdFunction);

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

    const singleProductResource = allProductsResource.addResource('{id}');
    singleProductResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductByIdFunction)
    );
  }
}
