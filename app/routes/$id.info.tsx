import { ActionFunctionArgs } from '@remix-run/node';
import { Form, useOutletContext } from '@remix-run/react';
import type { ReactNode } from 'react';

import Title from '~/components/Title';
import { useSelector } from '~/store/isomorphic';
import styles from './$id.info.module.css';
import IconButton from '~/components/IconButton';
import { commitSession, getSession } from '~/sessions.server';
import { OutletContext } from './$id';

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

function Keycap({ children }: { children: ReactNode }) {
  return <kbd className={styles.keycap}>{children}</kbd>;
}

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);
  const { zoom } = useOutletContext<OutletContext>();

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
        <ul className={styles.list}>
          <li>
            <span>Allowed Solutions</span>{' '}
            <span className={styles.keys}>
              <Keycap>A–Z</Keycap>, <Keycap>0–9</Keycap>, <Keycap>@</Keycap>, <Keycap>#</Keycap>,{' '}
              <Keycap>$</Keycap>, <Keycap>%</Keycap>, <Keycap>&</Keycap>, <Keycap>+</Keycap>,{' '}
              <Keycap>?</Keycap>
            </span>
          </li>
          <li>
            <span>Rotate Selection</span> <Keycap>Space</Keycap>
          </li>
          <li>
            <span>Toggle Pencil Mode</span> <Keycap>.</Keycap>
          </li>
          <li>
            <span>Clear square</span>{' '}
            <span className={styles.keys}>
              <Keycap>Backspace</Keycap>, <Keycap>Delete</Keycap>
            </span>
          </li>
          <li>
            <span>Move cursor</span>{' '}
            <span className={styles.keys}>
              <Keycap>←</Keycap>, <Keycap>↑</Keycap>, <Keycap>→</Keycap>, <Keycap>↓</Keycap>
            </span>
          </li>
          <li>
            <span>Next clue</span> <Keycap>Tab</Keycap>
          </li>
          <li>
            <span>Previous clue</span>{' '}
            <span className={styles.keys}>
              <Keycap>Shift</Keycap> + <Keycap>Tab</Keycap>
            </span>
          </li>
        </ul>
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
        </ul>
      </div>
    </div>
  );
}
