import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from 'uuid';

const sqsClient = new SQSClient();
const BOOKING_QUEUE_URL = process.env.BOOKING_QUEUE_URL;
let tableName = process.env.ACMS_DB;

export const handler = async (appsyncInput: any): Promise<boolean> => {
  const createdOn = Date.now().toString();
  const id: string = "shdf0-3fjs-4r94wj"; //uuidv4();

  console.log(appsyncInput);
  const bookingInput = {
    PK: "BOOKING",
    SK: `USER#${appsyncInput.arguments.input.userId}`,
    GS1PK: `BOOKING#${id}`,
    GSI1SK: `APARTMENT#${appsyncInput.arguments.input.apartmentId}`,
    ...appsyncInput.arguments.input,
    createdOn,
  };
  if (tableName === undefined) {
    tableName = "AcmsDynamoDBTable";
  }

  const input = {
    QueueUrl: BOOKING_QUEUE_URL,
    MessageBody: JSON.stringify(bookingInput),
  };
  const command = new SendMessageCommand(input);

  console.log(`create booking input info", ${JSON.stringify(bookingInput)}`);
  try {
    await sqsClient.send(command);
    return true;
  } catch (error) {
    console.log(`an error occured while sending message to sqs", ${error}`);
    throw Error(`an error occured while sending message to sqs", ${error}`);
  }
};
