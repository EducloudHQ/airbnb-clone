import { Context, DynamoDBQueryRequest } from "@aws-appsync/utils";
import {
  QueryGetApartmentFeedbackArgs,
  RatingsAndFeedback,
} from "../../types/appsync";

export function request(
  ctx: Context<QueryGetApartmentFeedbackArgs>
): DynamoDBQueryRequest {
  // add timestamps
  const item = ctx.args!;
  const pk = `APARTMENT#${item.apartmentId}`
  const sk = 'FEEDBACK#'

  return {
    operation: "Query",
    query: {
      expression: "PK = :pk and begins_with(SK, :sk)",
      expressionValues: util.dynamodb.toMapValues({ ":pk": pk, ":sk": sk }),
    }
  };
}

export function response(
  ctx: Context<
  QueryGetApartmentFeedbackArgs,
    object,
    object,
    object,
    RatingsAndFeedback
  >
) {
  return ctx.result;
}
