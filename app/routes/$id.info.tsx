import { useSelector } from '~/store/isomorphic';
import styles from './$id.info.module.css';

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{puzzle?.title}</h1>
      <p>{puzzle?.author}</p>
      <p>{puzzle?.copyright}</p>
    </div>
  );
}
