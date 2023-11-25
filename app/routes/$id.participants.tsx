import { useOutletContext } from '@remix-run/react';
import { useState } from 'react';
import classNames from 'classnames';

import IconButton from '~/components/IconButton';
import Title from '~/components/Title';
import { useExecute, useSelector } from '~/store/isomorphic';
import type { DeviceType } from '~/store/remote/users';
import styles from './$id.participants.module.css';
import { OutletContext } from './$id';

function getDeviceTypeIcon(deviceType?: DeviceType) {
  switch (deviceType) {
    case 'console':
      return 'videogame_asset';
    case 'desktop':
      return 'computer';
    case 'mobile':
      return 'smartphone';
    case 'smarttv':
      return 'live_tv';
    case 'tablet':
      return 'tablet';
    case 'wearable':
      return 'watch';
    case 'embedded':
    default:
      return 'person';
  }
}

export default function View() {
  const { userId } = useOutletContext<OutletContext>();
  const execute = useExecute();
  const users = useSelector(({ remote }) => remote.users);
  const [editing, setEditing] = useState<'name' | 'color' | false>(false);

  const userList = Object.values(users);
  userList.sort((a, b) => (a.id === userId ? -1 : b.id === userId ? 1 : 0));

  const changeName = (name: string) => {
    execute({ type: 'USER_RENAMED', payload: { id: userId, name } });
    setEditing(false);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    changeName(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      changeName(event.currentTarget.value);
    }
  };

  return (
    <div className={styles.container}>
      <Title>Participants</Title>
      <ul className={styles.list}>
        {userList.map(({ id, color, deviceType, name }) => (
          <li key={id} className={styles.listItem}>
            <span className={classNames('material-icons', styles.icon)} style={{ color }}>
              {getDeviceTypeIcon(deviceType)}
            </span>

            <span className={styles.name} style={{ color }}>
              {editing === 'name' && id === userId ? (
                <input
                  autoFocus
                  className={styles.input}
                  defaultValue={name}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  maxLength={50}
                />
              ) : (
                name
              )}
            </span>

            {id === userId && <IconButton name="edit" onClick={() => setEditing('name')} />}
          </li>
        ))}
      </ul>
    </div>
  );
}
