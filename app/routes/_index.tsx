import DropZone from '~/components/DropZone';
import styles from './_index.module.css';

export default () => (
  <div className={styles.container}>
    <DropZone onChange={(event) => console.log(event.target.files)} />
    <p className={styles.caption}>Upload a .puz file to start a new game</p>
  </div>
);
