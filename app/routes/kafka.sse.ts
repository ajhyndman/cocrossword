import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';
import { getKafkaClient } from '~/kafkajs/client';

import { messageLog } from '~/kafkajs/index';

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const index = body.get('index');
  const client = body.get('client');
  const type = body.get('type') as string;
  const payload = body.get('payload') as string;
  const { producer } = await getKafkaClient();
  await producer.send({
    topic: 'crossword-actions',
    messages: [{ key: 'ACTION', value: JSON.stringify({ index, client, type, payload }) }],
  });

  return redirect('/puzzle');
}

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send) => {
    const unsubscribe = messageLog.subscribe((messages) => {
      const actions = messages.map((message) => message.value?.toString() ?? '');
      send({ event: 'ACTION', data: JSON.stringify(actions) });
    });

    return unsubscribe;
  });
}
