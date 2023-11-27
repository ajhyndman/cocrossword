import { Link, useMatches, useOutletContext } from '@remix-run/react';
import classNames from 'classnames';

import { useExecute, useSelector } from '~/store/isomorphic';
import FloatingActionButton from './FloatingActionButton';
import styles from './NavigationRail.module.css';
import { OutletContext } from '~/routes/$id';

function NavButton({
  active,
  icon,
  label,
  to,
}: {
  active?: boolean;
  icon: string;
  label: string;
  to: string;
}) {
  return (
    <Link className={styles.button} to={to}>
      <div className={classNames(styles.highlight, { [styles.active]: active })}>
        <span className={classNames('material-icons', styles.icon)}>{icon}</span>
      </div>
      <span>{label}</span>
    </Link>
  );
}

export default function NavigationRail() {
  const { id } = useOutletContext<OutletContext>();
  const matches = useMatches();
  const { index, isPencil } = useSelector(({ local }) => local);
  const execute = useExecute();

  console.log(matches);

  const checkSolution = () => {
    execute({ type: 'CHECK_PUZZLE' });
  };

  const handleDownload = () => {
    execute({ type: 'DOWNLOAD_PUZZLE' });
  };

  const handleTogglePencil = () => {
    execute({ type: 'TOGGLE_PENCIL' });
  };

  const handleToggleRebus = () => {
    if (index) {
      execute({ type: 'TOGGLE_STARRED', payload: { index } });
    }
  };

  return (
    <div className={styles.container}>
      <FloatingActionButton
        label="Toggle pencil mode"
        name={isPencil ? 'edit_off' : 'edit'}
        onClick={handleTogglePencil}
        style="primary"
      />
      <FloatingActionButton
        label="Star/Unstar square"
        name="star"
        onClick={handleToggleRebus}
        size="small"
        style="secondary"
      />
      <FloatingActionButton
        label="Check puzzle"
        name="check_box"
        onClick={checkSolution}
        size="small"
        style="secondary"
      />
      <FloatingActionButton
        label="Download puzzle"
        name="download"
        onClick={handleDownload}
        size="small"
        style="secondary"
      />

      <div className={styles.spacer} />

      <NavButton
        active={matches.some((match) => match.id === 'routes/d.$id._layout._index')}
        icon="window"
        label="Puzzle"
        to={`/d/${id}`}
      />
      <NavButton
        active={matches.some((match) => match.id === 'routes/d.$id._layout.chat')}
        icon="chat"
        label="Chat"
        to={`/d/${id}/chat`}
      />

      {/* <IconButton name="window" />
      <IconButton name="chat" /> */}
    </div>
  );
}
