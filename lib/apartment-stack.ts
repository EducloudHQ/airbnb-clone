import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { bundleAppSyncResolver } from "./helpers";
import { join } from "path";

interface ApartmentStackProps extends StackProps {
  airbnbGraphqlApi: appsync.GraphqlApi;
  airbnbDatabase: Table;
}

export class ApartmentLamdaStacks extends Stack {
  constructor(scope: Construct, id: string, props: ApartmentStackProps) {
    super(scope, id, props);

    const { airbnbDatabase, airbnbGraphqlApi } = props;

    const apartmentFunction = new appsync.AppsyncFunction(
      this,
      "createApartment",
      {
        name: "createApartment",
        api: airbnbGraphqlApi,
        dataSource: airbnbGraphqlApi.addDynamoDbDataSource(
          "createApartment",
          airbnbDatabase,
        ),
        code: bundleAppSyncResolver(
          "src/resolvers/apartment/createApartment.ts",
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      },
    );

    new appsync.Resolver(this, "createApartmentResolver", {
      api: airbnbGraphqlApi,
      typeName: "Mutation",
      fieldName: "createApartment",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js"),
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [apartmentFunction],
    });

    const getAllApartmentsPerBuilding = new appsync.AppsyncFunction(
      this,
      "getAllApartmentsPerBuilding",
      {
        name: "getAllApartmentsPerBuilding",
        api: airbnbGraphqlApi,
        dataSource: airbnbGraphqlApi.addDynamoDbDataSource(
          "getAllApartmentsPerBuilding",
          airbnbDatabase,
        ),
        code: bundleAppSyncResolver(
          "src/resolvers/apartment/getAllApartmentsPerBuilding.ts",
        ),
        runtime: appsync.FunctionRuntime.JS_1_0_0,
      },
    );

    new appsync.Resolver(this, "getAllApartmentsPerBuildingResolver", {
      api: airbnbGraphqlApi,
      typeName: "Query",
      fieldName: "getAllApartmentsPerBuilding",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js"),
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getAllApartmentsPerBuilding],
    });
  }
}
