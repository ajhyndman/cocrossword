import type { ActionFunctionArgs } from '@remix-run/node';
import { useEventSource } from 'remix-utils/sse/react';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import DropZone from '~/components/DropZone';
import styles from './_index.module.css';

export async function action({ params }: ActionFunctionArgs) {
  return {};
}

export async function loader() {
  return json({ data: 1234 });
}

export default () => {
  const data = useLoaderData();
  const message = useEventSource('/sse/kafka', { event: 'message' });

  console.log(data);
  console.log(message);

  return (
    <div className={styles.container}>
      <DropZone onChange={(event) => console.log(event.target.files)} />
      <p className={styles.caption}>Upload a .puz file to start a new game</p>
      <p>{message}</p>
    </div>
  );
};
