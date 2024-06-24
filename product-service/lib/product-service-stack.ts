import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsTable = dynamodb.Table.fromTableName(
      this,
      'ProductsDynamoTable',
      'products'
    );
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'StocksDynamoTable',
      'stocks'
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
