import classNames from 'classnames';

import styles from './IconButton.module.css';

type Props = {
  tag?: string;
  name: string;
  notify?: boolean;
  onClick?: () => void;
};

export default function IconButton({ tag = 'button', name, notify, onClick }: Props) {
  // rename to uppercase so React can recognize this as a variable
  const TagName = tag;
  return (
    // @ts-expect-error TS doesn't know this tagname is a standard HTML element
    <TagName className={styles.button} onClick={onClick}>
      <span className={classNames('material-icons', styles.icon)}>{name}</span>
      {notify && <div className={styles.badge} />}
    </TagName>
  );
}
