import { v4 } from 'uuid';
import { json } from '@remix-run/node';

import { commitSession, getSession } from '~/sessions.server';
import { loadStore } from '~/store/remote';
import { randomItem } from './randomItem';
import { MIDDLE_EARTH_NAMES } from './constants';
import isbot from 'isbot';

export async function login(request: Request, id: string) {
  // if this is a bot request, do not assign a session
  if (isbot(request.headers.get('User-Agent'))) {
    return {};
  }

  // if there is a real puzzle, return session
  const cookie = request.headers.get('Cookie');
  const session = await getSession(cookie);

  let userId = session.get('userId');
  let headers = {};

  // if session not yet populated, initialize user
  if (!userId) {
    userId = v4();
    session.set('userId', userId);
    headers = { 'Set-Cookie': await commitSession(session) };
  }

  const { dispatch, getState } = await loadStore(id);
  const user = getState().users[userId];

  // generate a new user if none exists
  if (!user) {
    // generate a placeholder name
    const name = randomItem(MIDDLE_EARTH_NAMES);

    dispatch({ type: 'USER_JOINED', payload: { id: userId, name } });
  }

  return json({ userId }, { headers });
}
