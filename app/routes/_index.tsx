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
    [...event.dataTransfer.items].forEach((item) => {
      // If dropped items aren't files, reject them
      if (item.kind === 'file') {
        const file = item.getAsFile();
        submitFile(file!);
      }
    });
  };

  const handleLaunchNyt = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // prevent default behaviour (submitting the form immediately)
    event.preventDefault();

    // @ts-expect-error The typedef for EventTarget doesn't include the dataset attribute
    const difficulty = event.target.dataset.difficulty;

    const response = await fetch(`/nyt/${difficulty}`, { method: 'POST' });
    const blob = await response.blob();
    const file = new File([blob], 'nyt.puz');
    submitFile(file);
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
        <h1 className={styles.title}>co-crossword</h1>
        <p className={styles.subtitle}>don&apos;t puzzle alone!</p>
        <div className={styles.section}>
          <DropZone onChange={handleUpload} />
        </div>
        <input name="key" type="hidden" value={gameId} />
        <input name="type" type="hidden" value="NEW_PUZZLE" />
        <input name="payload" type="hidden" ref={valueRef} />
        <input name="client" type="hidden" value={CLIENT_ID} />
        <input name="index" type="hidden" value={0} />
        {/* <p className={styles.caption}>Don&apos;t puzzle alone!</p> */}
        <p className={styles.caption}>Upload a .puz file to get started</p>
        <p>
          <a
            className={styles.info}
            href="https://www.fleetingimage.com/wij/xyzzy/nyt-links.html"
            target="_blank"
            rel="noreferrer"
          >
            Where can I find .puz files?
          </a>
        </p>

        <div className={styles.sectionBreak}>
          <p className={styles.caption}>— OR —</p>
        </div>
        <div className={styles.section}>
          <p>
            <button className={styles.button} data-difficulty="1" onClick={handleLaunchNyt}>
              Mon
            </button>
            <button className={styles.button} data-difficulty="2" onClick={handleLaunchNyt}>
              Tue
            </button>
            <button className={styles.button} data-difficulty="3" onClick={handleLaunchNyt}>
              Wed
            </button>
            <button className={styles.button} data-difficulty="4" onClick={handleLaunchNyt}>
              Thu
            </button>
            <button className={styles.button} data-difficulty="5" onClick={handleLaunchNyt}>
              Fri
            </button>
            <button className={styles.button} data-difficulty="6" onClick={handleLaunchNyt}>
              Sat
            </button>
            <button className={styles.button} data-difficulty="0" onClick={handleLaunchNyt}>
              Sun
            </button>
          </p>
        </div>
        <p className={styles.caption}>Launch a puzzle from the NYT archive</p>
      </div>
    </Form>
  );
}
