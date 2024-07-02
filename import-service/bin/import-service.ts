import * as cdk from 'aws-cdk-lib';
import { ImportServiceStack } from '../lib/import-service-stack';

const app = new cdk.App();
const s3ImportBucket =
  (process.env.S3_IMPORT_BUCKET as string) || 'import-service-stack-bucket';
new ImportServiceStack(app, 'ImportServiceStack', s3ImportBucket);
