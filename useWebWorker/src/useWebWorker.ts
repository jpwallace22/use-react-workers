import { useCallback, useEffect, useRef, useState } from 'react';
import createWorkerBlobUrl from './utils/createWorkerBlobUrl';
import { useDeepCallback } from './hooks/useDeepCallback';

export enum WorkerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  ERROR = 'error',
  EXPIRED = 'expired',
  KILLED = 'killed',
}

type WorkerController = {
  status: WorkerStatus;
  kill: () => void;
};

export enum TRANSFERABLE_TYPE {
  AUTO = 'auto',
  NONE = 'none',
}

interface Options {
  timeout?: number;
  remoteDependencies?: string[];
  autoTerminate?: boolean;
  transferable?: TRANSFERABLE_TYPE;
}

interface Promise {
  resolve?: (result: any | ErrorEvent) => void;
  reject?: (result: any) => void;
}

const DEFAULT_OPTIONS = {
  timeout: undefined,
  remoteDependencies: [],
  autoTerminate: true,
  transferable: TRANSFERABLE_TYPE.AUTO,
};

/**
 * @param {Function} fn the function to run with web worker
 * @param {Object} options useWebWorker option params
 */
export const useWebWorker = <T extends (...fnArgs: any[]) => any>(
  fn: T,
  options: Options = DEFAULT_OPTIONS
) => {
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>(
    WorkerStatus.IDLE
  );
  const worker = useRef<Worker & { _url?: string }>();
  const isRunning = useRef(false);
  const promise = useRef<Promise>({});
  const timeoutId = useRef<NodeJS.Timeout>();

  const killWorker = useCallback(() => {
    if (worker.current?._url) {
      worker.current.terminate();
      URL.revokeObjectURL(worker.current._url);
      promise.current = {};
      worker.current = undefined;
      clearTimeout(timeoutId.current);
    }
  }, []);

  const onWorkerEnd = useCallback(
    (status: WorkerStatus) => {
      const terminate =
        options.autoTerminate !== null
          ? options.autoTerminate
          : DEFAULT_OPTIONS.autoTerminate;

      if (terminate) {
        killWorker();
      }
      setWorkerStatus(status);
    },
    [options.autoTerminate, killWorker, setWorkerStatus]
  );

  const generateWorker = useDeepCallback(() => {
    const {
      remoteDependencies = DEFAULT_OPTIONS.remoteDependencies,
      timeout = DEFAULT_OPTIONS.timeout,
      transferable = DEFAULT_OPTIONS.transferable,
    } = options;

    const workerUrl = createWorkerBlobUrl(fn, remoteDependencies, transferable);

    const newWorker: Worker & { _url?: string } = new Worker(workerUrl);
    newWorker._url = workerUrl;

    newWorker.onmessage = (e: MessageEvent) => {
      const [status, result] = e.data as [WorkerStatus, ReturnType<T>];

      switch (status) {
        case WorkerStatus.IDLE:
          promise.current.resolve?.(result);
          onWorkerEnd(WorkerStatus.IDLE);
          break;
        default:
          promise.current.reject?.(result);
          onWorkerEnd(WorkerStatus.ERROR);
          break;
      }
    };

    newWorker.onerror = (e: ErrorEvent) => {
      promise.current.reject?.(e);
      onWorkerEnd(WorkerStatus.ERROR);
    };

    if (timeout) {
      timeoutId.current = setTimeout(() => {
        killWorker();
        setWorkerStatus(WorkerStatus.EXPIRED);
      }, timeout);
    }

    return newWorker;
  }, [fn, options, killWorker]);

  const callWorker = useCallback(
    (...workerArgs: Parameters<T>) => {
      const { transferable = DEFAULT_OPTIONS.transferable } = options;
      return new Promise<ReturnType<T>>((resolve, reject) => {
        promise.current = {
          resolve,
          reject,
        };
        const transferList: any[] =
          transferable === TRANSFERABLE_TYPE.AUTO
            ? workerArgs.filter(
                (val: any) =>
                  ('ArrayBuffer' in window && val instanceof ArrayBuffer) ||
                  ('MessagePort' in window && val instanceof MessagePort) ||
                  ('ImageBitmap' in window && val instanceof ImageBitmap) ||
                  ('OffscreenCanvas' in window &&
                    val instanceof OffscreenCanvas)
              )
            : [];

        worker.current?.postMessage([[...workerArgs]], transferList);

        setWorkerStatus(WorkerStatus.RUNNING);
      });
    },
    [setWorkerStatus, options]
  );

  const workerHook = useCallback(
    (...fnArgs: Parameters<T>) => {
      const terminate =
        options.autoTerminate != null
          ? options.autoTerminate
          : DEFAULT_OPTIONS.autoTerminate;

      if (isRunning.current) {
        /* eslint-disable-next-line no-console */
        console.error(
          '[useWebWorker] You can only run one instance of the worker at a time, if you want to run more than one in parallel, create another instance with the hook useWebWorker(). Read more: https://github.com/jpwallace22/useWebWorker'
        );
        return Promise.reject();
      }
      if (terminate || !worker.current) {
        worker.current = generateWorker();
      }

      return callWorker(...fnArgs);
    },
    [options.autoTerminate, generateWorker, callWorker]
  );

  const killWorkerController = useCallback(() => {
    killWorker();
    setWorkerStatus(WorkerStatus.KILLED);
  }, [killWorker, setWorkerStatus]);

  const workerController = {
    status: workerStatus,
    kill: killWorkerController,
  };

  useEffect(() => {
    isRunning.current = workerStatus === WorkerStatus.RUNNING;
  }, [workerStatus]);

  useEffect(
    () => () => {
      killWorker();
    },
    [killWorker]
  );

  return [workerHook, workerController] as [
    typeof workerHook,
    WorkerController
  ];
};
