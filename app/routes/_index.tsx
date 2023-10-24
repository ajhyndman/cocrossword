import { parseBinaryFile } from '@ajhyndman/puz';
import { Form } from '@remix-run/react';

import DropZone from '~/components/DropZone';
import styles from './_index.module.css';
import { useRef } from 'react';

export default () => {
  const valueRef = useRef<HTMLInputElement>();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file != null && valueRef.current) {
      try {
        const buffer = await file.arrayBuffer();
        const puzzle = parseBinaryFile(buffer as Uint8Array);
        valueRef.current.value = JSON.stringify(puzzle);
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Form action="/kafka/action" method="POST">
      <div className={styles.container}>
        <DropZone onChange={handleUpload} />
        <input name="type" type="hidden" value="NEW_PUZZLE" />
        {/* @ts-ignore typedef mismatch between react ref prop and useRef */}
        <input name="payload" type="hidden" ref={valueRef} />
        <p className={styles.caption}>Upload a .puz file to start a new game</p>
        <button type="submit">GO</button>
      </div>
    </Form>
  );
};
