import { Context, DynamoDBBatchGetItemRequest } from '@aws-appsync/utils';
import { QueryGetUserAccountArgs, User } from '../../types/appsync';

export function request(
  ctx: Context<QueryGetUserAccountArgs>,
): DynamoDBBatchGetItemRequest {
  // add timestamps
  const id = ctx.args.id;
  const keys = [{ id: id }];
  return {
    operation: 'BatchGetItem',
    tables: {
        AcmsDynamoDBTable: {
          keys: keys,
          consistentRead: true,
        },
      },
  };
}

export function response(
  ctx: Context<QueryGetUserAccountArgs, object, object, object, User>,
) {
  return ctx.result;
}