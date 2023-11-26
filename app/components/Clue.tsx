import classNames from 'classnames';

import styles from './Clue.module.css';

type Props = {
  content: string;
  index: number;
  state?: 'primary' | 'secondary';
};

export default function Clue({ index, content, state }: Props) {
  return (
    <p
      className={classNames(styles.listItem, {
        [styles.primary]: state === 'primary',
        [styles.secondary]: state === 'secondary',
      })}
    >
      <span className={styles.index}>{index}</span>
      <span>{content}</span>
    </p>
  );
}
