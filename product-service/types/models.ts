import * as AWS from 'aws-sdk';
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

// export const convertDynamoDBItem = <T>(item: AWS.DynamoDB.DocumentClient.AttributeMap): T => {
//   return Object.keys(item).reduce((acc: any, key) => {
//     const value = item[key];
//     if (typeof value === 'object' && value !== null) {
//       if ('S' in value) {
//         acc[key] = value.S;
//       } else if ('N' in value) {
//         acc[key] = Number(value.N);
//       }
//     } else {
//       acc[key] = value;
//     }
//     return acc;
//   }, {}) as T;
// };