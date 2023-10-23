import { useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

export function useEventSourceReducer<S, E>(
  route: string,
  eventName: string,
  reducer: (state: S | undefined, message: E) => S,
) {
  const eventSource = useRef<EventSource>();
  const state = useRef<S>();

  const [snapshot, setSnapshot] = useState<S>();

  // Don't trigger a react re-render on _every_ update
  const setSnapshotDebounced = debounce((nextState: S) => setSnapshot(nextState), 100);

  useEffect(() => {
    eventSource.current = new EventSource(route);
  }, []);

  useEffect(() => {
    const source = eventSource.current;
    if (!source) return;

    const handleEvent = (event: MessageEvent<E>) => {
      const nextState = reducer(state.current, event.data);
      state.current = nextState;

      setSnapshotDebounced(nextState);
    };

    source.addEventListener(eventName, handleEvent);
    return () => source.removeEventListener(eventName, handleEvent);
  }, []);

  return snapshot;
}
