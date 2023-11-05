import { getKafkaClient } from './client';
import { Log } from './log';
import type { KafkaMessage } from 'kafkajs';

let init: Promise<Log<KafkaMessage>>;

export async function getMessageLog() {
  if (init) return init;

  init = new Promise(async (resolve) => {
    const messageLog = new Log<KafkaMessage>();
    const { consumer } = await getKafkaClient();

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        messageLog.push(message);
      },
    });
    await consumer.seek({ topic: 'crossword-actions', partition: 0, offset: '0' });

    resolve(messageLog);

    console.info('kafkajs :: local log populated');
  });

  return init;
}
