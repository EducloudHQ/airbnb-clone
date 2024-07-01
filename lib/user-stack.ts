import { Stack, StackProps } from "aws-cdk-lib";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { join } from "path";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { bundleAppSyncResolver } from "./helpers";

interface UserStackProps extends StackProps {
  airbnbGraphqlApi: appsync.GraphqlApi;
  airbnbDatabase: Table;
}
export class UserStacks extends Stack {
  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, props);

    const { airbnbDatabase, airbnbGraphqlApi } = props;
    const airbnbDataSource = airbnbGraphqlApi.addDynamoDbDataSource(
      "airbnbdbs",
      airbnbDatabase
    )
    const airbnbUserFunction = new appsync.AppsyncFunction(this, "createUserAccount", {
      name: "createUserAccount",
      api: airbnbGraphqlApi,
      dataSource: airbnbDataSource,
      code: bundleAppSyncResolver("src/resolvers/user/createUserAccount.ts"),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });

    const getUserAccount = new appsync.AppsyncFunction(this, "getUserAccount", {
      name: "getUserAccount",
      api: airbnbGraphqlApi,
      dataSource: airbnbDataSource,
      code: bundleAppSyncResolver("src/resolvers/user/getUserAccount.ts"),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
    });

    new appsync.Resolver(this, "getUserAccountResolver", {
      api: airbnbGraphqlApi,
      typeName: "Query",
      fieldName: "getUserAccount",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js")
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [getUserAccount],
    });

    new appsync.Resolver(this, "createUserResolver", {
      api: airbnbGraphqlApi,
      typeName: "Mutation",
      fieldName: "createUserAccount",
      code: appsync.Code.fromAsset(
        join(__dirname, "./js_resolvers/_before_and_after_mapping_template.js")
      ),
      runtime: appsync.FunctionRuntime.JS_1_0_0,
      pipelineConfig: [airbnbUserFunction],
    });
  }
}

