import { Context, DynamoDBQueryRequest } from "@aws-appsync/utils";
import {
  QueryGetAllApartmentsPerBuildingArgs,
  Apartment,
} from "../../types/appsync";

export function request(
  ctx: Context<QueryGetAllApartmentsPerBuildingArgs>
): DynamoDBQueryRequest {
  // add timestamps
  const item = ctx.args;
  const pk = `BUILDING#${item.buildingId}`;
  const sk = `APARTMENT#`;

  return {
    operation: "Query",
    query: {
      expression: "PK = :pk and begins_with(SK, :sk)",
      expressionValues: util.dynamodb.toMapValues({ ":pk": pk, ":sk": sk }),
    },
  };
}

export function response(
  ctx: Context<
    QueryGetAllApartmentsPerBuildingArgs,
    object,
    object,
    object,
    Apartment
  >
) {
  return ctx.result;
}
