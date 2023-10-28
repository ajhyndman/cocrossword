import { useEffect, useRef, useState } from 'react';

export function useKafkaReducer<S, E>(
  route: string,
  eventName: string,
  reducer: (state: S, message: E) => S,
  init: S,
) {
  const actions = useRef([]);
  const animationFrameCallback = useRef(-1);
  const [snapshot, setSnapshot] = useState<S>(init);

  useEffect(() => {
    const eventSource = new EventSource(route);

    const handleEvent = (event: MessageEvent<string>) => {
      // parse action
      const action = JSON.parse(event.data);
      action.payload = JSON.parse(action.payload);
      actions.current.push(action);

      // schedule state rebuild on next paint
      window.cancelAnimationFrame(animationFrameCallback.current);
      animationFrameCallback.current = window.requestAnimationFrame(() => {
        const state = actions.current.reduce(reducer, init);
        setSnapshot(state);
      });
    };

    eventSource.addEventListener(eventName, handleEvent);
    return () => {
      eventSource.removeEventListener(eventName, handleEvent);
      eventSource.close();
    };
  }, []);

  return snapshot;
}
