import { memo } from 'react';

import styles from './BottomAppBar.module.css';

type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default memo(function BottomAppBar({ left, right }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.left}>{left}</span>
      <span className={styles.right}>{right}</span>
    </div>
  );
});
