import { Context, DynamoDBPutItemRequest, util } from "@aws-appsync/utils";
import { createItem } from "../../lib/helpers";
import { MutationCreateApartmentArgs, Apartment } from "../../types/appsync";

export function request(
  ctx: Context<MutationCreateApartmentArgs>,
): DynamoDBPutItemRequest {
  // add timestamps
  const item = createItem(ctx.args.input!);

  return {
    operation: "PutItem",
    key: util.dynamodb.toMapValues({
      PK: `BUILDING#${item.buildingId}`,
      SK: `APARTMENT#${util.autoId()}`,
    }),
    attributeValues: util.dynamodb.toMapValues({
      publishDate: util.time.nowISO8601(),
      ENTITY: "APARTMENT",
      ...item,
    }),
  };
}

export function response(
  ctx: Context<MutationCreateApartmentArgs, object, object, object, Apartment>,
) {
  return ctx.result;
}
