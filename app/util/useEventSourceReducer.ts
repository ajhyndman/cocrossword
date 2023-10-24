import { useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';

export function useEventSourceReducer<S, E>(
  route: string,
  eventName: string,
  reducer: (state: S, message: E) => S,
  init: S,
) {
  const state = useRef<S>(init);
  const [snapshot, setSnapshot] = useState<S>(init);

  // Don't trigger a react re-render on _every_ update
  const setSnapshotDebounced = debounce((nextState: S) => setSnapshot(nextState), 100);

  useEffect(() => {
    const eventSource = new EventSource(route);

    const handleEvent = (event: MessageEvent<string>) => {
      // parse action
      const action = JSON.parse(event.data);
      action.payload = JSON.parse(action.payload);
      console.log(action);

      const nextState = reducer(state.current, action);
      state.current = nextState;

      setSnapshotDebounced(nextState);
    };

    eventSource.addEventListener(eventName, handleEvent);
    return () => {
      eventSource.removeEventListener(eventName, handleEvent);
      eventSource.close();
    };
  }, []);

  console.log(snapshot);

  return snapshot;
}
