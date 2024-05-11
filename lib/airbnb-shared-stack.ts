import { CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import * as appsync from "aws-cdk-lib/aws-appsync";
import {
  AttributeType,
  BillingMode,
  ProjectionType,
  StreamViewType,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { readFileSync } from "fs";

export class AirbnbSharedStack extends Stack {
  public readonly airbnbDatabase: Table;
  public readonly airbnbGraphqlApi: appsync.GraphqlApi;
  public readonly apiSchema: appsync.CfnGraphQLSchema;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * UserPool and UserPool Client
     */
    const userPool: UserPool = new cognito.UserPool(
      this,
      "airbnbCognitoUserPool",
      {
        selfSignUpEnabled: true,
        accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
        userVerification: {
          emailStyle: cognito.VerificationEmailStyle.CODE,
        },
        autoVerify: {
          email: true,
        },
        standardAttributes: {
          email: {
            required: true,
            mutable: true,
          },
        },
      }
    );

    const userPoolClient: UserPoolClient = new cognito.UserPoolClient(
      this,
      "airbnbUserPoolClient",
      {
        userPool,
      }
    );

    /**
     * GraphQL API
     */
    this.airbnbGraphqlApi = new appsync.GraphqlApi(this, "Api", {
      name: "airbnb",
      schema: appsync.SchemaFile.fromAsset("schema/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },

        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool,
            },
          },
        ],
      },
      xrayEnabled: true,
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
    });

    /**
     * Graphql Schema
     */

    this.apiSchema = new appsync.CfnGraphQLSchema(this, "airbnbGraphqlApiSchema", {
      apiId: this.airbnbGraphqlApi.apiId,
      definition: readFileSync("./schema/schema.graphql").toString(),
    });

    /**
     * Database
     */

    this.airbnbDatabase = new Table(this, "airbnbDynamoDbTable", {
      tableName: "airbnbDynamoDBDatabaseTable",

      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },

      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,

      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.airbnbDatabase.addGlobalSecondaryIndex({
      indexName: "getAllApartmentsPerUser",
      partitionKey: {
        name: "GSI1PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: AttributeType.STRING,
      },

      projectionType: ProjectionType.ALL,
    });


    /**
     * Outputs
     */

    new CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });

    new CfnOutput(this, "GraphQLAPI ID", {
      value: this.airbnbGraphqlApi.apiId!,
    });

    new CfnOutput(this, "GraphQLAPI URL", {
      value: this.airbnbGraphqlApi.graphqlUrl,
    });
  }
}
