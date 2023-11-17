import classNames from 'classnames';

import styles from './IconButton.module.css';

type Props = {
  name: string;
  notify?: boolean;
  onClick?: () => void;
};

export default function IconButton({ name, notify, onClick }: Props) {
  return (
    <button className={styles.button} onClick={onClick}>
      <span className={classNames('material-icons', styles.icon)}>{name}</span>
      {notify && <div className={styles.badge} />}
    </button>
  );
}
