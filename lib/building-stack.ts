import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { bundleAppSyncResolver } from "./helpers";
import { join } from "path";

interface BuildingStackProps extends StackProps {
  airbnbGraphqlApi: appsync.GraphqlApi;
  airbnbDatabase: Table;
}

export class BuildingStacks extends Stack {
  constructor(scope: Construct, id: string, props: BuildingStackProps) {
    super(scope, id, props);

    const { airbnbDatabase, airbnbGraphqlApi } = props;

    const buildingFunction = new appsync.AppsyncFunction(
      this,
      "createBuilding",
      {
        name: "createBuilding",
        api: airbnbGraphqlApi,
        dataSource: airbnbGraphqlApi.addDynamoDbDataSource(
          "airbnbBuildingDataSource",
          airbnbDatabase
        ),
        code: bundleAppSyncResolver("src/resolvers/building/createBuilding.ts"),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      }
    );

    new appsync.Resolver(this, "createBuildingResolver", {
      api: airbnbGraphqlApi,
      typeName: "Mutation",
      fieldName: "createBuilding",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js")
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [buildingFunction],
    });

  }
}
