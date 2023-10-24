import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';
import { getKafkaClient } from '~/kafkajs/client';

import { messageLog } from '~/kafkajs/index';

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const type = body.get('type') as string;
  const payload = body.get('payload') as string;
  const { producer } = await getKafkaClient();
  await producer.send({
    topic: 'my-topic',
    messages: [{ key: 'ACTION', value: JSON.stringify({ type, payload }) }],
  });

  return redirect('/puzzle');
}

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send) => {
    const unsubscribe = messageLog.subscribe((message) => {
      send({ event: message.key?.toString(), data: message.value?.toString() ?? '' });
    });

    return unsubscribe;
  });
}
