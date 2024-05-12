import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { bundleAppSyncResolver } from "./helpers";
import { join } from "path";

interface RatingsAndFeedbackStackProps extends StackProps {
  airbnbGraphqlApi: appsync.GraphqlApi;
  airbnbDatabase: Table;
}

export class RatingsAndFeedbackStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: RatingsAndFeedbackStackProps
  ) {
    super(scope, id, props);

    const { airbnbDatabase, airbnbGraphqlApi } = props;

    const leaveFeedback = new appsync.AppsyncFunction(this, "leaveFeedback", {
      name: "leaveFeedback",
      api: airbnbGraphqlApi,
      dataSource: airbnbGraphqlApi.addDynamoDbDataSource(
        "airbnbFeedbackDataSource",
        airbnbDatabase
      ),
      code: bundleAppSyncResolver(
        "src/resolvers/ratingsAndFeedback/leaveFeedback.ts"
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });

    new appsync.Resolver(this, "leaveFeedbackResolver", {
      api: airbnbGraphqlApi,
      typeName: "Mutation",
      fieldName: "leaveFeedback",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js")
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [leaveFeedback],
    });

    const getApartmentFeedback = new appsync.AppsyncFunction(
      this,
      "ApartmentFeedback",
      {
        name: "getApartmentFeedback",
        api: airbnbGraphqlApi,
        dataSource: airbnbGraphqlApi.addDynamoDbDataSource(
          "FeedbackDataSource",
          airbnbDatabase
        ),
        code: bundleAppSyncResolver(
          "src/resolvers/ratingsAndFeedback/getApartmentFeedback.ts"
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      }
    );

    new appsync.Resolver(this, "getApartmentFeedbackResolver", {
      api: airbnbGraphqlApi,
      typeName: "Query",
      fieldName: "getApartmentFeedback",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js")
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getApartmentFeedback],
    });
  }
}
