export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count?: number;
}

export interface Stock {
  product_id: string;
  count: number;
}

// export interface DynamoDBProduct {
//   id: { S: string };
//   title: { S: string };
//   description: { S: string };
//   price: { N: string };
//   count?: { N: string };
// }

// export interface DynamoDBStock {
//   product_id: { S: string };
//   count: { N: string };
// }


// export function convertDynamoDBProductToProduct(
//   dynamoDBProduct: DynamoDBProduct
// ): Product {
//   return {
//     id: dynamoDBProduct.id.S,
//     title: dynamoDBProduct.title.S,
//     description: dynamoDBProduct.description.S,
//     price: parseFloat(dynamoDBProduct.price.N),
//   };
// }

// export function convertDynamoDBStockToStock(dynamoDBStock: DynamoDBStock): {
//   productId: string;
//   count: number;
// } {
//   return {
//     productId: dynamoDBStock.product_id.S,
//     count: parseInt(dynamoDBStock.count.N, 10),
//   };
// }