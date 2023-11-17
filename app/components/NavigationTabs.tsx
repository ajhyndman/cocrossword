import { useMemo } from 'react';

import Tabs from './Tabs';
import { useStore } from '~/store/remote';

type Props = {
  id: string;
  userId: string;
};

export default function NavigationTabs({ id, userId }: Props) {
  const {
    state: { readReceipts, messages },
  } = useStore();

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
