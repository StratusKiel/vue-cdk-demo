import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

export class VueCdkDemoStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const websiteBucket = new s3.Bucket(this, 'VueCdkDemoSiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    const webDistribution = new cloudfront.Distribution(this, 'VueCdkDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket)
      }
    });

    const websiteDeploy = new s3deploy.BucketDeployment(this, 'VueCdkDemoSiteDeployment', {
      sources: [ s3deploy.Source.asset('vue/dist') ],
      destinationBucket: websiteBucket,
      distribution: webDistribution,
      distributionPaths: [ '/*' ]
    });
  }
}
