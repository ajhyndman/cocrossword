import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';

import { getKafkaClient } from '~/kafkajs/client';
import { getMessageLog } from '~/kafkajs/index';

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const key = body.get('key') as string;
  const index = body.get('index');
  const client = body.get('client');
  const type = body.get('type') as string;
  const payload = body.get('payload') as string;
  const { producer } = await getKafkaClient();
  await producer.send({
    topic: 'crossword-actions',
    messages: [
      { key, value: JSON.stringify({ index, client, type, payload: JSON.parse(payload) }) },
    ],
  });

  if (type === 'NEW_PUZZLE') {
    return redirect(`/${key}/puzzle`);
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const messageLog = await getMessageLog();

  return eventStream(request.signal, (send) => {
    const unsubscribe = messageLog.subscribe((messages) => {
      const actions = messages
        .filter((message) => message.key?.toString() === (params.get('key') as string))
        .map((message) => message.value?.toString() ?? '');
      send({ event: params.get('key') as string, data: JSON.stringify(actions) });
    });

    return unsubscribe;
  });
}
