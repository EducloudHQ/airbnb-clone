import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';

interface BookingStackProps extends StackProps {
  api: appsync.GraphqlApi;
  tableName: string;
}

export class BookingStack extends Stack {
  constructor(scope: Construct, id: string, props: BookingStackProps) {
    super(scope, id, props);

    const { api, tableName } = props;

    const dlq = new sqs.Queue(this, "DeadLetterQueue");
    const queue = new sqs.Queue(this, "bookingQueue", {
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 10,
      },
    });

    const lambdaFn = new lambda.Function(this, "AppSyncLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "createApartmentBooking.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda-fns")),
      environment: {
        BOOKING_QUEUE_URL: queue.queueUrl,
      },
    });

    const sqsConsumer = new lambda.Function(this, "sqsConsumer", {
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: "sqsConsumer.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "./lambda-fns")),
        environment: {
          BOOKING_QUEUE_URL: queue.queueUrl
        },
      });
    const lambdaDs = api.addLambdaDataSource("lambdaDatasource", lambdaFn);
      
    const eventSource = new lambdaEventSources.SqsEventSource(queue);

    sqsConsumer.addEventSource(eventSource);
    lambdaDs.createResolver("mutRes", {
      typeName: "Mutation",
      fieldName: "createApartmentBooking",
    });
    queue.grantConsumeMessages(sqsConsumer)

    queue.grantSendMessages(lambdaFn);
  }
}
