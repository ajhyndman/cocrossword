import { memo } from 'react';

import styles from './TopAppBar.module.css';

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default memo(({ left, right }: Props) => (
  <div className={styles.container}>
    <span className={styles.left}>{left}</span>
    <span className={styles.right}>{right}</span>
  </div>
));
