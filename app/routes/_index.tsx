import { parseBinaryFile } from '@ajhyndman/puz';
import { Form, useSubmit } from '@remix-run/react';
import { useMemo, useRef } from 'react';
import { v4 } from 'uuid';

import DropZone from '~/components/DropZone';
import { CLIENT_ID } from '~/util/constants';
import styles from './_index.module.css';

export default function View() {
  const valueRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  const gameId = useMemo(() => {
    const uuid = v4();
    return uuid.split('-')[0];
  }, []);

  const submitFile = async (file?: File) => {
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

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    submitFile(file);
  };

  const handleDrag = (event: React.DragEvent<HTMLFormElement>) => {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLFormElement>) => {
    // Prevent default behavior (Prevent file from being opened)
    event.preventDefault();

    // Use DataTransferItemList interface to access the file(s)
    [...event.dataTransfer?.items!].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        submitFile(file!);
      }
    });
  };

  return (
    <Form
      action="/kafka/sse"
      method="POST"
      ref={formRef}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
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
}
