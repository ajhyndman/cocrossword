import { getKafkaClient } from './client';
import { Log } from './log';
import type { KafkaMessage } from 'kafkajs';

// TODO: When should this buffer be initialized and how long should it live?
export const messageLog = new Log<KafkaMessage>();

async function initMessageLog() {
  const { consumer } = await getKafkaClient();

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      messageLog.push(message);
    },
  });

  await consumer.seek({ topic: 'crossword-actions', partition: 0, offset: '0' });

  console.info('kafkajs :: local log populated');
}

// populate log
initMessageLog();
