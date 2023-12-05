import { Link, useMatches } from '@remix-run/react';
import classNames from 'classnames';

import styles from './Tabs.module.css';

type Tab = {
  href: string;
  icon: string;
  id: string;
  notify?: boolean;
};

type Props = {
  tabs: Tab[];
};

export default function Tabs({ tabs }: Props) {
  const matches = useMatches();

  return (
    <div className={styles.container}>
      {tabs.map(({ href, icon, id, notify }) => {
        const isActive = matches.some((match) => match.id === id);
        return (
          <Link
            key={id}
            to={href}
            className={classNames(styles.tab, { [styles.active]: isActive })}
          >
            <span className={classNames('material-icons', styles.icon)}>
              {icon}
              {notify && <div className={styles.badge} />}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
