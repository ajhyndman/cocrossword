import classNames from 'classnames';

import styles from './FloatingActionButton.module.css';

type Props = {
  name: string;
  onClick?: () => void;
  size?: 'small' | 'normal' | 'large';
};

export default ({ name, onClick, size }: Props) => (
  <button
    className={classNames(styles.button, {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
    })}
    onClick={onClick}
  >
    <span className={classNames('material-icons', styles.icon)}>{name}</span>
  </button>
);
