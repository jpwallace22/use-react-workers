export enum WorkerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error',
  EXPIRED = 'expired',
  KILLED = 'killed',
}

export enum TRANSFERABLE_TYPE {
  AUTO = 'auto',
  NONE = 'none',
}

export interface Options {
  timeout?: number;
  remoteDependencies?: string[];
  autoTerminate?: boolean;
  transferable?: TRANSFERABLE_TYPE;
}
