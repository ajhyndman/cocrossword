import { isHealthy } from '~/kafkajs/client';

export async function loader() {
  if (await isHealthy()) {
    return 'ok';
  }

  throw new Error('Kafka client is in an unhealthy state');
}
