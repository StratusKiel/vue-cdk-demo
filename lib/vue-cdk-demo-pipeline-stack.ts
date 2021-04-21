import * as cdk from '@aws-cdk/core';
import * as pipelines from "@aws-cdk/pipelines";
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as iam from '@aws-cdk/aws-iam';
import { VueCdkDemoStack } from './vue-cdk-demo-stack';

export class VueCdkDemoDeploymentStage extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new VueCdkDemoStack(this, 'VueApplication');
  }
}

export class VueCdkDemoPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     const sourceArtifact = new codepipeline.Artifact();
     const destinationArtifact = new codepipeline.Artifact();

     const pipeline = new pipelines.CdkPipeline(this, 'VueCdkDemoPipeline', {
      cloudAssemblyArtifact: destinationArtifact,
      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'GitHub',
        branch: 'main',
        output: sourceArtifact,
        oauthToken: cdk.SecretValue.secretsManager('stratuskiel-github-pat'),
        owner: 'StratusKiel',
        repo: 'vue-cdk-demo'
      }),
      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact: destinationArtifact,
        buildCommand: 'cd vue && npm ci && npm run build && cd ..'
      })
     });

     pipeline.addApplicationStage(new VueCdkDemoDeploymentStage(this, 'VueApplicationDeployment'));

     pipeline.codePipeline.role.addToPrincipalPolicy(iam.PolicyStatement.fromJson({
      "Action": [
        "cloudformation:*"
      ],
      "Resource": "*",
      "Effect": "Allow"
    }));

    pipeline.codePipeline.role.addToPrincipalPolicy(iam.PolicyStatement.fromJson({
      "Condition": {
        "ForAnyValue:StringEquals": {
          "aws:CalledVia": [
            "cloudformation.amazonaws.com"
          ]
        }
      },
      "Action": "*",
      "Resource": "*",
      "Effect": "Allow"
    }));
    
    pipeline.codePipeline.role.addToPrincipalPolicy(iam.PolicyStatement.fromJson({
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::cdktoolkit-stagingbucket-*",
      "Effect": "Allow"
    }));
  }
}