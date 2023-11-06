import { parseBinaryFile } from '@ajhyndman/puz';
import { Form, useSubmit } from '@remix-run/react';
import { useMemo, useRef } from 'react';
import { v4 } from 'uuid';

import DropZone from '~/components/DropZone';
import { CLIENT_ID } from '~/util/constants';
import styles from './_index.module.css';

export default () => {
  const valueRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  const gameId = useMemo(() => {
    const uuid = v4();
    return uuid.split('-')[0];
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file != null && valueRef.current) {
      try {
        const buffer = await file.arrayBuffer();
        const puzzle = parseBinaryFile(buffer as Uint8Array);
        valueRef.current.value = JSON.stringify(puzzle);

        submit(formRef.current);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Form action="/kafka/sse" method="POST" ref={formRef}>
      <div className={styles.container}>
        <DropZone onChange={handleUpload} />
        <input name="key" type="hidden" value={gameId} />
        <input name="type" type="hidden" value="NEW_PUZZLE" />
        <input name="payload" type="hidden" ref={valueRef} />
        <input name="client" type="hidden" value={CLIENT_ID} />
        <input name="index" type="hidden" value={0} />
        <p className={styles.caption}>Upload a .puz file to start a new game</p>
      </div>
    </Form>
  );
};
