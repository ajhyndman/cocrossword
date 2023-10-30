import styles from './ChatMessage.module.css';

type Props = {
  author: string;
  color: string;
  message: string;
};

export default ({ author, color, message }: Props) => {
  return (
    <div className={styles.container}>
      <span className={styles.author} style={{ color }}>
        {author}
      </span>
      <span className={styles.message}>{message}</span>
    </div>
  );
};
