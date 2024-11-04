import { AirbnbSharedStack } from "./airbnb-shared-stack";
import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserStacks } from "./user-stack";
import { BuildingStacks } from "./building-stack";
import { ApartmentStacks } from "./apartment-stack";
import { RatingsAndFeedbackStack } from "./ratings-feedback-stack";
import { BookingStack } from "./booking-stack";

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

      new BuildingStacks(this, "BuildingStacks", {
        airbnbDatabase: sharedStack.airbnbDatabase,
        airbnbGraphqlApi: sharedStack.airbnbGraphqlApi,
      });

      new ApartmentStacks(this, "ApartmentStacks", {
        airbnbDatabase: sharedStack.airbnbDatabase,
        airbnbGraphqlApi: sharedStack.airbnbGraphqlApi,
      });


      new BookingStack(this, "BookingStack", {});

      new RatingsAndFeedbackStack(this, "RatingsAndFeedbackStacks", {
        airbnbDatabase: sharedStack.airbnbDatabase,
        airbnbGraphqlApi: sharedStack.airbnbGraphqlApi,
      });
  }
}