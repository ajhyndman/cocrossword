import styles from './FloatingActionButton.module.css';

type Props = {
  onClick?: () => void;
  name: string;
};

export default ({ name, onClick }: Props) => (
  <button className={styles.button} onClick={onClick}>
    <span className={`material-icons ${styles.icon}`}>{name}</span>
  </button>
);
