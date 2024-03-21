import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3 as s3 } from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class S3StackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    new s3.Bucket(this, "Voices_bucket", {
      //versioned: true
      //accessControl: s3.BucketAccessControl.PUBLIC_READ_WRITE,
      lifecycleRules: [{ expiration: cdk.Duration.days(3) }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      publicReadAccess: true,
    });
  }
}
