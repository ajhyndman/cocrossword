import { useOutletContext } from '@remix-run/react';
import classNames from 'classnames';
import { useRef, useState } from 'react';

import IconButton from '~/components/IconButton';
import type { DeviceType } from '~/store/remote/users';
import { useExecute, useSelector } from '~/store/isomorphic';
import { OutletContext } from '~/routes/$id';
import styles from './Participants.module.css';

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

export default function Participants() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { userId } = useOutletContext<OutletContext>();
  const execute = useExecute();
  const users = useSelector(({ remote }) => remote.users);
  const [editing, setEditing] = useState<boolean>(false);

  const userList = Object.values(users);
  userList.sort((a, b) => (a.id === userId ? -1 : b.id === userId ? 1 : 0));

  const toggleEditName = () => {
    setEditing(!editing);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const changeName = (name: string) => {
    execute({ type: 'USER_RENAMED', payload: { id: userId, name } });
    setEditing(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === 'Escape') {
      changeName(event.currentTarget.value);
    }
  };

  return (
    <ul className={styles.list}>
      {userList.map(({ id, color, deviceType, name }) => (
        <li key={id} className={styles.listItem}>
          <span className={classNames('material-icons', styles.icon)} style={{ color }}>
            {getDeviceTypeIcon(deviceType)}
          </span>

          <span className={styles.name} style={{ color }}>
            {editing && id === userId ? (
              <input
                ref={inputRef}
                autoFocus
                className={styles.input}
                defaultValue={name}
                onKeyDown={handleKeyDown}
                maxLength={50}
              />
            ) : (
              name
            )}
          </span>

          {id === userId && (
            <IconButton name={editing ? 'close' : 'edit'} onClick={toggleEditName} />
          )}
        </li>
      ))}
    </ul>
  );
}
