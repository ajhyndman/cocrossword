import throttle from 'lodash.throttle';
import type { KafkaMessage, Message } from 'kafkajs';

import { getKafkaClient } from './client';
import { Log } from './log';

type KafkaAction = Pick<KafkaMessage, 'key' | 'value'>;

let init: Promise<Log<KafkaAction>>;
let MESSAGE_QUEUE: Message[] = [];

const flushMessages = throttle(async () => {
  const { producer } = await getKafkaClient();
  const messages = MESSAGE_QUEUE;
  MESSAGE_QUEUE = [];
  await producer.send({ topic: 'crossword-actions', messages });
}, 10);

export async function dispatch(key: string, action: unknown) {
  MESSAGE_QUEUE.push({ key, value: JSON.stringify(action) });
  flushMessages();
}

export async function getMessageLog() {
  if (init) return init;

  // eslint-disable-next-line no-async-promise-executor
  init = new Promise(async (resolve) => {
    const messageLog = new Log<KafkaAction>();
    const { consumer } = await getKafkaClient();

    await consumer.run({
      eachMessage: async ({ message }) => {
        messageLog.push({ key: message.key, value: message.value });
      },
    });
    await consumer.seek({ topic: 'crossword-actions', partition: 0, offset: '0' });

    resolve(messageLog);

    console.info('kafkajs :: local log populated');
  });

  return init;
}
