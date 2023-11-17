import { useOutletContext } from '@remix-run/react';
import { useState } from 'react';
import classNames from 'classnames';

import IconButton from '~/components/IconButton';
import { useStore } from '~/store/remote';
import styles from './$id.participants.module.css';
import { DeviceType } from '~/store/remote/users';

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
  const { userId } = useOutletContext<{ userId: string }>();
  const {
    dispatch,
    state: { users },
  } = useStore();
  const [editing, setEditing] = useState<'name' | 'color' | false>(false);

  const userList = Object.values(users);
  userList.sort((a, b) => (a.id === userId ? -1 : b.id === userId ? 1 : 0));

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    dispatch({ type: 'USER_RENAMED', payload: { id: userId, name: event.target.value } });
    setEditing(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Participants</h1>
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
                  maxLength={50}
                />
              ) : (
                name
              )}
            </span>

            {id === userId && (
              <>
                <IconButton name="edit" onClick={() => setEditing('name')} />
                {/* <button className={styles.button} onClick={() => setEditing('color')}>
                  <div className={styles.swatch} style={{ backgroundColor: color }} />
                </button> */}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
