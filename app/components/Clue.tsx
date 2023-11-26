import styles from './Clue.module.css';

type Props = {
  content: string;
  index: number;
  isActive?: boolean;
};

export default function Clue({ index, content, isActive = false }: Props) {
  return (
    <p className={`${styles.listItem} ${isActive ? styles.active : ''}`}>
      <span className={styles.index}>{index}</span>
      <span>{content}</span>
    </p>
  );
}
