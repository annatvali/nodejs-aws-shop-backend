import { SQSEvent } from 'aws-lambda';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';

type CSVProduct = {
  title: string;
  description: string;
  price: number;
  count: number;
};

class ProductService {
  private dbClient: DynamoDBDocumentClient;
  private snsClient: SNSClient;

  constructor() {
    const dynamoClient = new DynamoDBClient({});
    this.dbClient = DynamoDBDocumentClient.from(dynamoClient);
    this.snsClient = new SNSClient({});
  }

  async createProduct(product: CSVProduct): Promise<void> {
    const { title, description, price, count } = product;
    const productId = uuidv4();

    await this.storeProduct(productId, title, description, price, count);
    await this.notifyProductCreation(title, price, description, count);
  }

  private async storeProduct(
    productId: string,
    title: string,
    description: string,
    price: number,
    count: number
  ): Promise<void> {
    const transactionCommand = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: process.env.PRODUCTS_TABLE_NAME,
            Item: { id: productId, price, title, description },
          },
        },
        {
          Put: {
            TableName: process.env.STOCKS_TABLE_NAME,
            Item: { product_id: productId, count },
          },
        },
      ],
    });
    await this.dbClient.send(transactionCommand);
  }

  private async notifyProductCreation(
    title: string,
    price: number,
    description: string,
    count: number
  ): Promise<void> {
const message = `New product added: "${title}" with a price of $${price}, description: "${description}", and a stock count of ${count}.`;
    const publishCommand = new PublishCommand({
      TopicArn: process.env.SNS_ARN,
      Message: message,
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: price.toString(),
        },
      },
    });
    await this.snsClient.send(publishCommand);
  }
}

export const handler = async (event: SQSEvent): Promise<void> => {
  const productsList: CSVProduct[] = event.Records.flatMap((record) =>
    JSON.parse(record.body)
  );
  const productService = new ProductService();

  for (const product of productsList) {
    try {
      await productService.createProduct(product);
      console.log(`Product processed: ${product.title}`);
    } catch (error) {
      console.log('Error processing product', error);
    }
  }
};
