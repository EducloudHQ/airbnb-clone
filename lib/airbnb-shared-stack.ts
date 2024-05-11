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
  public readonly acmsDatabase: Table;
  public readonly acmsGraphqlApi: appsync.GraphqlApi;
  public readonly apiSchema: appsync.CfnGraphQLSchema;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    /**
     * UserPool and UserPool Client
     */
    const userPool: UserPool = new cognito.UserPool(
      this,
      "ACMSCognitoUserPool",
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
      "ACMSUserPoolClient",
      {
        userPool,
      }
    );

  }
}
