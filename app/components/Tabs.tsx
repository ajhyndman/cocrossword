import { Link, useMatches } from '@remix-run/react';
import classNames from 'classnames';

import styles from './Tabs.module.css';

type Tab = {
  href: string;
  icon: string;
  notify?: boolean;
};

type Props = {
  tabs: Tab[];
};

export default ({ tabs }: Props) => {
  const matches = useMatches();

  return (
    <div className={styles.container}>
      {tabs.map(({ href, icon, notify }) => {
        const isActive = matches.some(({ pathname }) => pathname === href);
        return (
          <Link
            key={icon}
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
};
