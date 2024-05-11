import { Context, DynamoDBPutItemRequest, util } from '@aws-appsync/utils';
import { createItem } from '../../lib/helpers';
import { MutationCreateBuildingArgs, Building } from '../../types/appsync';

export function request(
  ctx: Context<MutationCreateBuildingArgs>,
): DynamoDBPutItemRequest {
  // add timestamps
  const item = createItem(ctx.args.input!);
  const id = util.autoId()

  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: "BUILDING",
      SK: `BUILDING#${id}`
    }),
    attributeValues: util.dynamodb.toMapValues({
      GSI2PK: `USER#${item.userId}`,
      GSI2SK: `BUILDING#${id}`,
      ENTITY: "BUILDING",
      createdOn: util.time.nowISO8601(),
      ...item,
    }),
  };
}

export function response(
  ctx: Context<MutationCreateBuildingArgs, object, object, object, Building>,
) {
  return ctx.result;
}