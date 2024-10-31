import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
  ManualApprovalStep,
} from "aws-cdk-lib/pipelines";
import { PipelineStage } from "./pipeline-stage";

export class AirbnbCloneStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "PipelineTs", {
      synth: new ShellStep("synth", {
        input: CodePipelineSource.gitHub("vernyuy/airbnb-clone", "dev"),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    /*********************************
     *    Add development stage
     *********************************/
    const devStage = pipeline.addStage(
      new PipelineStage(this, "PipelineDevStage", {
        stageName: "dev",
      })
    );

    const prodStage = pipeline.addStage(
      new PipelineStage(this, "PipelineProdStage", {
        stageName: "prod",
      })
    );

    devStage.addPost(
      new ManualApprovalStep("Manual aproval before production")
    );
  }
}
