import type { ReactNode } from 'react';

import styles from './Title.module.css';

type Props = {
  tag?: 'h1' | 'h2' | 'h3';
  children: ReactNode;
};

export default function Title({ tag = 'h1', children, ...other }: Props) {
  const Element = tag;
  return (
    <Element {...other} className={styles.title}>
      {children}
    </Element>
  );
}
