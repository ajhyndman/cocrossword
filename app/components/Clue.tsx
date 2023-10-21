import styles from './Clue.module.css';

type Props = {
  content: string;
  index: number;
  isActive?: boolean;
};

export default ({ index, content, isActive = false }: Props) => (
  <li className={`${styles.listItem} ${isActive ? styles.active : ''}`}>
    <span className={styles.index}>{index}</span>
    <span>{content}</span>
  </li>
);
