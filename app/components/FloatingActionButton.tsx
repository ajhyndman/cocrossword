import classNames from 'classnames';

import styles from './FloatingActionButton.module.css';

type Props = {
  label: string;
  name: string;
  onBlur?: () => void;
  onClick?: () => void;
  size?: 'small' | 'normal' | 'large';
  style?: 'primary' | 'secondary' | 'default';
  transparent?: boolean;
};

export default function FloatingActionButton({
  label,
  name,
  onBlur,
  onClick,
  size,
  style,
  transparent,
}: Props) {
  return (
    <button
      title={label}
      className={classNames(styles.button, {
        [styles.small]: size === 'small',
        [styles.large]: size === 'large',
        [styles.transparent]: transparent,
        [styles.primary]: style === 'primary',
        [styles.secondary]: style === 'secondary',
      })}
      onBlur={onBlur}
      onClick={onClick}
    >
      <span className={classNames('material-icons', styles.icon)}>{name}</span>
    </button>
  );
}
