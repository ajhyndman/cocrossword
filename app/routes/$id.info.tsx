import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useOutletContext } from '@remix-run/react';

import Title from '~/components/Title';
import AppInfo from '~/components/AppInfo';
import IconButton from '~/components/IconButton';
import { commitSession, getSession } from '~/sessions.server';
import { useExecute, useSelector } from '~/store/isomorphic';
import githubIcon from '~/mark-github-16.svg';
import kofiIcon from '~/ko-fi.svg';
import type { OutletContext } from './$id';
import styles from './$id.info.module.css';

export async function action({ request }: ActionFunctionArgs) {
  const data = await request.formData();
  const direction = data.get('direction');

  const session = await getSession(request.headers.get('Cookie'));
  const zoom = session.get('zoom') || 100;

  let nextZoom = zoom + (direction === 'IN' ? 12.5 : -12.5);
  nextZoom = Math.max(nextZoom, 75);
  nextZoom = Math.min(nextZoom, 125);
  session.set('zoom', nextZoom);

  return new Response(null, { headers: { 'Set-Cookie': await commitSession(session) } });
}

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);
  const { zoom } = useOutletContext<OutletContext>();
  const execute = useExecute();

  const handleDownload = () => {
    execute({ type: 'DOWNLOAD_PUZZLE' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Title>Puzzle Info</Title>
        <div className={styles.puzzleInfo}>
          <h2 className={styles.puzzleTitle}>{puzzle?.title}</h2>
          <p>{puzzle?.author}</p>
          <p>{puzzle?.copyright}</p>
        </div>
      </div>
      <div className={styles.section}>
        <Title>App Info</Title>
        <Title tag="h2">Keyboard shortcuts</Title>
        <AppInfo />
      </div>
      <div className={styles.section}>
        <Title>Settings</Title>
        <ul className={styles.list}>
          <li>
            Zoom ({zoom}%)
            <span className={styles.buttonGroup}>
              <Form method="POST">
                <input type="hidden" name="direction" value="OUT" />
                <IconButton name="zoom_out" />
              </Form>
              <Form method="POST">
                <input type="hidden" name="direction" value="IN" />
                <IconButton name="zoom_in" />
              </Form>
            </span>
          </li>
          <li>
            Download puzzle
            <span className={styles.buttonGroup}>
              <IconButton name="download" onClick={handleDownload} />
            </span>
          </li>
        </ul>
      </div>
      <div className={styles.section}>
        <Title>About</Title>
        <p>
          View this project on{' '}
          <a
            className={styles.link}
            href="https://github.com/ajhyndman/crossword-app/issues/1"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <img className={styles.icon} src={githubIcon} alt="github icon" />
          </a>
          .
        </p>
        <p>
          If you enjoy this website, please consider{' '}
          <a
            className={styles.link}
            href="https://ko-fi.com/C0C2RO28J"
            target="_blank"
            rel="noreferrer"
          >
            leaving a tip <img className={styles.icon} src={kofiIcon} alt="" />
          </a>
          .
        </p>
      </div>
    </div>
  );
}
