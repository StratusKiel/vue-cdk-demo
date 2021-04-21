#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VueCdkDemoDeploymentStage, VueCdkDemoPipelineStack } from '../lib/vue-cdk-demo-pipeline-stack';

const app = new cdk.App();
new VueCdkDemoPipelineStack(app, 'VueCdkDemoPipelineStack');
