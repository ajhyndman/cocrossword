import styles from './DropZone.module.css';

type Props = {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default ({ onChange }: Props) => (
  <label className={styles.label}>
    <span className="material-icons" style={{ fontSize: 56 }}>
      upload
    </span>
    <input
      name="file"
      type="file"
      accept=".puz"
      className={styles.input}
      onChange={onChange}
    ></input>
  </label>
);
