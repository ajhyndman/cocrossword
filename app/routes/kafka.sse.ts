import { LoaderFunctionArgs } from '@remix-run/node';
import { messageLog } from '~/kafkajs/index';

import { eventStream } from 'remix-utils/sse/server';

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send) => {
    const unsubscribe = messageLog.subscribe((message) => {
      send({ event: message.key?.toString(), data: message.value?.toString() ?? '' });
    });

    return unsubscribe;
  });
}
