import styles from './IconButton.module.css';

type Props = {
  name: string;
  notify?: boolean;
  onClick?: () => void;
};

export default ({ name, notify, onClick }: Props) => (
  <button className={styles.button} onClick={onClick}>
    <span className={`material-icons ${styles.icon}`}>{name}</span>
    {notify && <div className={styles.badge} />}
  </button>
);
