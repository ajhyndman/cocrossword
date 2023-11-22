// - server reducer
// - client reducer (isolated)
// - unified provider
// - unified or split useState?
// - unified selectors / queries?
// - SSR support
// - server provides initial state
// - optimistic update + merge algorithm
// - "command" executor

// can be split off
// - client state / reducer
// - selectors
// - "commands" or "actions"

type BaseEvent = {
  type: string;
  payload?: unknown;
};

export type Reducer<State, E extends BaseEvent> = (state: State, event: E) => State;
export type Dispatch<E extends BaseEvent> = (event: E) => void;
export type Executor<State, Command extends BaseEvent, E extends BaseEvent> = (
  dispatch: Dispatch<E>,
  state: State,
  command: Command,
) => void;
export type Execute<Command extends BaseEvent> = (command: Command) => void;

class Store<State, Event extends BaseEvent, Command extends BaseEvent> {
  private executor: Executor<State, Command, Event>;
  private reducer: Reducer<State, Event>;
  private state: State;
  private onChange: (state: State) => void;

  constructor(
    executor: Executor<State, Command, Event>,
    reducer: Reducer<State, Event>,
    init: State,
    onChange: (state: State) => void,
  ) {
    this.executor = executor;
    this.reducer = reducer;
    this.state = init;
    this.onChange = onChange;
  }

  dispatch: Dispatch<Event> = (event) => {
    this.state = this.reducer(this.state, event);
    this.onChange(this.state);
  };

  execute: Execute<Command> = (command) => {
    this.executor(this.dispatch, this.state, command);
  };
}
