import * as cdk from 'aws-cdk-lib';
import { ImportServiceStack } from '../lib/import-service-stack';

const app = new cdk.App();

new ImportServiceStack(app, 'ImportServiceStack', process.env.S3_IMPORT_BUCKET as string);
