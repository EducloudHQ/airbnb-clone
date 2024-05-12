import { Context, DynamoDBGetItemRequest } from '@aws-appsync/utils';
import { QueryGetUserAccountArgs, User } from '../../types/appsync';

export function request(
  ctx: Context<QueryGetUserAccountArgs>,
): DynamoDBGetItemRequest {
  // add timestamps
  const id = ctx.args.id;

  return {
    operation: 'GetItem',
    key: util.dynamodb.toMapValues({
      PK: "USER",
      SK: `USER#${id}`
    })
  };
}

export function response(
  ctx: Context<QueryGetUserAccountArgs, object, object, object, User>,
) {
  console.log("Reslutss>>>>", ctx.result)
  return ctx.result;
}