import { useOutletContext } from '@remix-run/react';
import { useMemo } from 'react';

import { OutletContext } from '~/routes/$id';
import { useSelector } from '~/store/isomorphic';
import Tabs from './Tabs';

export default function NavigationTabs() {
  const { id, userId } = useOutletContext<OutletContext>();
  const readReceipts = useSelector(({ remote }) => remote.readReceipts);
  const messages = useSelector(({ remote }) => remote.messages);

  const userReadReceipts = readReceipts[userId];
  const hasUnreadMessages = useMemo(() => {
    return messages.length > (userReadReceipts ?? 0);
  }, [userReadReceipts, messages.length]);

  return (
    <Tabs
      tabs={[
        { icon: 'window', href: `/${id}/puzzle` },
        { icon: 'chat', href: `/${id}/chat`, notify: hasUnreadMessages },
        { icon: 'group', href: `/${id}/participants` },
        { icon: 'info', href: `/${id}/info` },
      ]}
    />
  );
}
