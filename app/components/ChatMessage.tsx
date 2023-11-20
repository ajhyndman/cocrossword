import styles from './ChatMessage.module.css';

type Props = {
  author: string;
  color: string;
  message: string;
  timestamp?: number;
};

export default function ChatMessage({ author, color, message, timestamp }: Props) {
  return (
    <div className={styles.container}>
      <span className={styles.author} style={{ color }}>
        {author}
      </span>
      <span className={styles.message}>{message}</span>
      {timestamp && (
        <span className={styles.timestamp}>{new Date(timestamp).toLocaleTimeString()}</span>
      )}
    </div>
  );
}
