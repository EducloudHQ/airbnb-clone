import { Context, DynamoDBPutItemRequest, util } from "@aws-appsync/utils";
import { createItem } from "../../lib/helpers";
import { MutationLeaveFeedbackArgs, RatingsAndFeedback } from "../../types/appsync";

export function request(
  ctx: Context<MutationLeaveFeedbackArgs>,
): DynamoDBPutItemRequest {
  // add timestamps
  const item = createItem(ctx.args.input!);

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      PK: `APARTMENT#${item.apartmentId}`,
      SK: `FEEDBACK#${util.autoId()}`,
    }),

    attributeValues: util.dynamodb.toMapValues({
      publishedOn: util.time.nowISO8601(),
      ENTITY: "FEEDBACK",
      ...item,
    }),
  };
}

export function response(
  ctx: Context<MutationLeaveFeedbackArgs, object, object, object, RatingsAndFeedback>,
) {
  return ctx.result;
}
