import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';

import { dispatch, getMessageLog } from '~/kafkajs';
import { loadStore } from '~/store/isomorphic/index.server';

function wait(ms: number) {
  return new Promise((resolve) => global.setTimeout(resolve, ms));
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const key = body.get('key') as string;
  const index = body.get('index');
  const client = body.get('client');
  const type = body.get('type') as string;
  const payload = body.get('payload') as string;
  await dispatch(key, { index, client, type, payload: JSON.parse(payload) });

  if (type === 'NEW_PUZZLE') {
    // wait for puzzle to populate
    // TODO: set a max timeout or exponential backoff?
    let puzzle;
    do {
      await wait(50);
      const { getState } = await loadStore(key);
      const state = getState();
      puzzle = state.puzzle;
    } while (puzzle == null);

    return redirect(`/${key}`);
  }

  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams;
  const key = params.get('key') as string;
  const offset = Number.parseInt(params.get('offset') as string);
  const messageLog = await getMessageLog();

  return eventStream(request.signal, (send) => {
    const unsubscribe = messageLog.subscribe((messages, offset) => {
      const actions = messages
        .filter((message) => message.key?.toString() === key)
        // .map((message) => message.value)
        // .map((message, i) => ({ ...message, offset: offset - messages.length + i }))
        // .map((message) => message.value?.toString() ?? '');
        .map(({ value }, i) => {
          const json = value?.toString() ?? '{}';
          const action = JSON.parse(json);
          return { ...action, offset: offset - messages.length + i };
        });

      send({ event: key, data: JSON.stringify(actions) });
    }, offset);

    return unsubscribe;
  });
}
