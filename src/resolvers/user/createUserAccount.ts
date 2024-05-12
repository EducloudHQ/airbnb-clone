import { Context, DynamoDBPutItemRequest, util } from '@aws-appsync/utils';
import { createItem } from '../../lib/helpers';
import { MutationCreateUserAccountArgs, User } from '../../types/appsync';

export function request(
  ctx: Context<MutationCreateUserAccountArgs>,
): DynamoDBPutItemRequest {
  const item = createItem(ctx.args.input!);
  const id = util.autoId()

  return {
    operation: 'PutItem',
    key: util.dynamodb.toMapValues({
      PK: "USER",
      SK: `USER#${id}`
    }),
    attributeValues: util.dynamodb.toMapValues({
      id: id,
      ENTITY: "USER",
      ...item,
    }),
  };
}

export function response(
  ctx: Context<MutationCreateUserAccountArgs, object, object, object, User>,
) {
  return ctx.result;
}