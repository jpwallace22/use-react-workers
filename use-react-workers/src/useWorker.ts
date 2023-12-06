import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPersistentBlobUrl } from './utils/createPersistentBlobUrl';
import { useDeepCallback } from './utils/useDeepCallback';
import {
  Options,
  TRANSFERABLE_TYPE,
  WorkerStatus,
} from 'use-react-workers/src/types';

const defaultOptions = {
  timeout: undefined,
  remoteDependencies: [],
  autoTerminate: false,
  transferable: TRANSFERABLE_TYPE.AUTO,
};

/**
 * @param {Function} func the function to run with web worker
 * @param {Options} options useWorkerFunc option params
 */
export const useWorker = <T extends (...funcArgs: any[]) => any>(
  func: T,
  options: Options = defaultOptions
): typeof workerHook => {
  const { autoTerminate, transferable, remoteDependencies, timeout } = {
    ...defaultOptions,
    ...options,
  };
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>(
    WorkerStatus.IDLE
  );

  const worker = useRef<Worker & { _url?: string }>();
  const timeoutId = useRef<NodeJS.Timeout>();

  const killWorker = useCallback(() => {
    if (worker.current?._url) {
      worker.current.terminate();
      URL.revokeObjectURL(worker.current._url);
      worker.current = undefined;
      clearTimeout(timeoutId.current);
    }
  }, []);

  const generateWorker = useDeepCallback(() => {
    const workerUrl = createPersistentBlobUrl(func, remoteDependencies);

    const webWorker: Worker & { _url?: string } = new Worker(workerUrl);
    webWorker._url = workerUrl;

    if (timeout) {
      timeoutId.current = setTimeout(() => {
        killWorker();
        setWorkerStatus(WorkerStatus.EXPIRED);
      }, timeout);
    }

    return webWorker;
  }, [func, options, killWorker]);

  const postMessage = useCallback(
    (...funcArgs: Parameters<T>) => {
      if (!worker.current || workerStatus !== WorkerStatus.RUNNING) {
        worker.current = generateWorker();
        setWorkerStatus(WorkerStatus.RUNNING);
      }

      const transferList: any[] =
        transferable === TRANSFERABLE_TYPE.AUTO
          ? funcArgs.filter(
              (val: any) =>
                ('ArrayBuffer' in window && val instanceof ArrayBuffer) ||
                ('MessagePort' in window && val instanceof MessagePort) ||
                ('ImageBitmap' in window && val instanceof ImageBitmap) ||
                ('OffscreenCanvas' in window && val instanceof OffscreenCanvas)
            )
          : [];
      worker.current?.postMessage([[...funcArgs]], transferList);
    },
    [generateWorker, transferable, workerStatus]
  );

  const onMessage = useCallback(
    (callBack: (e: MessageEvent) => void) => {
      if (!worker.current) return;
      try {
        worker.current.onmessage = (e: MessageEvent) => {
          callBack(e);
          if (autoTerminate) {
            killWorker();
            setWorkerStatus(WorkerStatus.IDLE);
          }
        };
      } catch (e) {
        throw new Error(e);
      } finally {
        if (autoTerminate) {
          killWorker();
          setWorkerStatus(WorkerStatus.IDLE);
        }
      }
    },
    [autoTerminate, killWorker]
  );

  const terminate = useCallback(() => {
    killWorker();
    setWorkerStatus(WorkerStatus.KILLED);
  }, [killWorker, setWorkerStatus]);

  const workerHook = useMemo(
    () => ({
      postMessage,
      onMessage,
      terminate,
      status: workerStatus,
    }),
    [postMessage, onMessage, terminate, workerStatus]
  );

  useEffect(() => {
    killWorker();
  }, [killWorker]);

  return workerHook;
};
