import { Kafka, Consumer, Producer, logLevel } from 'kafkajs';

let singleton: Promise<{ consumer: Consumer; producer: Producer }>;

export function getKafkaClient() {
  if (
    !process.env.KAFKA_BROKER_URL ||
    !process.env.KAFKA_SASL_USERNAME ||
    !process.env.KAFKA_SASL_PASSWORD
  ) {
    throw new Error('Whoops, you need to configure Kafka!  Please check your .env file.');
  }

  if (!singleton) {
    singleton = new Promise(async (resolve) => {
      const kafka = new Kafka({
        clientId: `crossword-app-${process.env.NODE_ENV}`,
        brokers: [process.env.KAFKA_BROKER_URL!],
        connectionTimeout: 45000,
        logLevel: logLevel.ERROR,
        ssl: true,
        sasl: {
          mechanism: 'plain', // scram-sha-256 or scram-sha-512
          username: process.env.KAFKA_SASL_USERNAME!,
          password: process.env.KAFKA_SASL_PASSWORD!,
        },
      });
      const producer = kafka.producer();
      const consumer = kafka.consumer({ groupId: 'node-group' });

      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({ topic: 'crossword-actions', fromBeginning: true });

      console.info('kafkajs :: connection established');

      resolve({ consumer, producer });
    });
  }

  return singleton;
}
