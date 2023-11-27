import { Outlet, useOutletContext } from '@remix-run/react';

import NavigationRail from '~/components/NavigationRail';
import styles from './d.$id._layout.module.css';

export default function View() {
  const context = useOutletContext();

  return (
    <>
      <NavigationRail />
      <div className={styles.container}>
        <Outlet context={context} />
      </div>
    </>
  );
}
