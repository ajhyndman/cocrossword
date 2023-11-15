import classNames from 'classnames';

import styles from './FloatingActionButton.module.css';

type Props = {
  label: string;
  name: string;
  onBlur?: () => void;
  onClick?: () => void;
  size?: 'small' | 'normal' | 'large';
  transparent?: boolean;
};

export default ({ label, name, onBlur, onClick, size, transparent }: Props) => (
  <button
    title={label}
    className={classNames(styles.button, {
      [styles.small]: size === 'small',
      [styles.large]: size === 'large',
      [styles.transparent]: transparent,
    })}
    onBlur={onBlur}
    onClick={onClick}
  >
    <span className={classNames('material-icons', styles.icon)}>{name}</span>
  </button>
);
