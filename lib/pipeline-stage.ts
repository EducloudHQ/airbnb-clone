import { AirbnbSharedStack } from "./airbnb-shared-stack";
import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserStacks } from "./user-stack";
import { BuildingStacks } from "./building-stack";

export class PipelineStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    /***********************************
     *    Instantiate the shared stack
     ***********************************/
    const sharedStack = new AirbnbSharedStack(this, "sharedStack");
    new UserStacks(this, "UserStacks", {
        airbnbDatabase: sharedStack.airbnbDatabase,
        airbnbGraphqlApi: sharedStack.airbnbGraphqlApi,
      });

      new BuildingStacks(this, "UserStacks", {
        airbnbDatabase: sharedStack.airbnbDatabase,
        airbnbGraphqlApi: sharedStack.airbnbGraphqlApi,
      });
  }
}