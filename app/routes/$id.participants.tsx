import Participants from '~/components/Participants';
import Title from '~/components/Title';
import styles from './$id.participants.module.css';

export default function View() {
  return (
    <div className={styles.container}>
      <Title>Participants</Title>
      <Participants />
    </div>
  );
}
