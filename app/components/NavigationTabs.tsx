import { useOutletContext } from '@remix-run/react';
import Tabs from './Tabs';
import { useStore } from '~/store/remote';
import { useMemo } from 'react';

type Props = {
  id: string;
  userId: string;
};

export default ({ id, userId }: Props) => {
  const {
    state: { readReceipts, messages },
  } = useStore();

  const hasUnreadMessages = useMemo(() => {
    return messages.length > (readReceipts[userId] ?? 0);
  }, [userId, readReceipts[userId], messages.length]);

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
};
