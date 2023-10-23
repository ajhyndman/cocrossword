import { ActionFunctionArgs, redirect } from '@remix-run/node';
import { getKafkaClient } from '~/kafkajs/client';

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const type = body.get('type') as string;
  const payload = body.get('payload') as string;
  const { producer } = await getKafkaClient();
  await producer.send({
    topic: 'my-topic',
    messages: [{ key: 'ACTION', value: JSON.stringify({ type, payload }) }],
  });

  return redirect('/puzzle');
}
