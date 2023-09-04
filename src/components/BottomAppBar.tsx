import React from 'react';

import styles from './BottomAppBar.module.css';

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default ({ left, right }: Props) => (
  <div className={styles.container}>
    <span className={styles.left}>{left}</span>
    <span>{right}</span>
  </div>
);
