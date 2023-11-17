import { ActionFunctionArgs } from '@remix-run/node';

import { dispatch } from '~/kafkajs';
import { BaseKafkaAction } from '~/store/redux-kafka';

/**
 * Accept a list of actions and dispatch them all to kafka
 */
export async function action({ request }: ActionFunctionArgs) {
  const keyActions: [string, BaseKafkaAction][] = await request.json();
  keyActions.forEach(([key, action]) => dispatch(key, action));

  return null;
}
