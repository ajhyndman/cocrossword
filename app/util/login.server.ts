import { v4 } from 'uuid';
import { commitSession, getSession } from '~/sessions.server';
import { loadUsersStore } from '~/store/users';
import { randomItem } from './randomItem';
import { json } from '@remix-run/node';
import { CHAT_COLORS, MIDDLE_EARTH_NAMES } from './constants';

export async function login(cookie: string | null, id: string) {
  const session = await getSession(cookie);

  let userId = session.get('userId');
  let headers = {};

  // if session not yet populated, initialize user
  if (!userId) {
    userId = v4();
    session.set('userId', userId);
    headers = { 'Set-Cookie': await commitSession(session) };
  }

  const { dispatch, getState } = await loadUsersStore(id);
  const user = getState().users[userId];

  // generate a new user if none exists
  if (!user) {
    // pick a random color
    const color = randomItem(CHAT_COLORS);
    // generate a placeholder name
    const name = randomItem(MIDDLE_EARTH_NAMES);

    dispatch({ type: 'USER_JOINED', payload: { id: userId, color, name } });
  }

  return json({ userId }, { headers });
}
