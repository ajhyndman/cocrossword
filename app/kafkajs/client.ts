import { Kafka, Consumer, Producer, logLevel } from 'kafkajs';

let singleton: Promise<{ consumer: Consumer; producer: Producer }>;

const SESSION_TIMEOUT = 45000;

let lastHeartbeat = 0;

export async function isHealthy() {
  // Consumer has heartbeat within the session timeout, so it is healthy
  return Date.now() - lastHeartbeat < SESSION_TIMEOUT;
}

export function getKafkaClient() {
  if (
    !process.env.KAFKA_BROKER_URL ||
    !process.env.KAFKA_CONSUMER_GROUP ||
    !process.env.KAFKA_SASL_USERNAME ||
    !process.env.KAFKA_SASL_PASSWORD
  ) {
    throw new Error('Whoops, you need to configure Kafka!  Please check your .env file.');
  }

  if (!singleton) {
    singleton = new Promise(async (resolve) => {
      const kafka = new Kafka({
        brokers: [process.env.KAFKA_BROKER_URL!],
        connectionTimeout: SESSION_TIMEOUT,
        logLevel: logLevel.ERROR,
        ssl: true,
        sasl: {
          mechanism: 'plain', // scram-sha-256 or scram-sha-512
          username: process.env.KAFKA_SASL_USERNAME!,
          password: process.env.KAFKA_SASL_PASSWORD!,
        },
      });
      const producer = kafka.producer();
      const consumer = kafka.consumer({ groupId: process.env.KAFKA_CONSUMER_GROUP! });

      consumer.on('consumer.heartbeat', ({ timestamp }) => {
        lastHeartbeat = timestamp;
      });

      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({ topic: 'crossword-actions', fromBeginning: true });

      console.info('kafkajs :: connection established');

      resolve({ consumer, producer });
    });
  }

  return singleton;
}
