import { useMemo } from 'react';

import Tabs from './Tabs';
import { useSelector } from '~/store/isomorphic';

type Props = {
  id: string;
  userId: string;
};

export default function NavigationTabs({ id, userId }: Props) {
  const readReceipts = useSelector(({ remote }) => remote.readReceipts);
  const messages = useSelector(({ remote }) => remote.messages);

  const userReadReceipts = readReceipts[userId];
  const hasUnreadMessages = useMemo(() => {
    return messages.length > (userReadReceipts ?? 0);
  }, [userReadReceipts, messages.length]);

  return (
    <Tabs
      tabs={[
        { icon: 'edit_square', href: `/${id}`, id: 'routes/$id._index' },
        { icon: 'chat', href: `/${id}/chat`, id: 'routes/$id.chat', notify: hasUnreadMessages },
        { icon: 'group', href: `/${id}/participants`, id: 'routes/$id.participants' },
        { icon: 'info', href: `/${id}/info`, id: 'routes/$id.info' },
      ]}
    />
  );
}
