import { getKafkaClient } from './client';
import { Log } from './log';
import type { KafkaMessage } from 'kafkajs';

// TODO: When should this buffer be initialized and how long should it live?
export const messageLog = new Log<KafkaMessage>();

async function initMessageLog() {
  const { consumer } = await getKafkaClient();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.debug({ value: message });
      messageLog.push(message);
    },
  });

  await consumer.seek({ topic: 'my-topic', partition: 0, offset: '2' });
}

// populate log
initMessageLog();
