import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPersistentBlobUrl } from './utils/createPersistentBlobUrl.ts';
import { useDeepCallback } from './utils/useDeepCallback.ts';
import { Options, TRANSFERABLE_TYPE, WorkerStatus } from './types.ts';

const defaultOptions = {
  timeout: undefined,
  remoteDependencies: [],
  autoTerminate: false,
  transferable: TRANSFERABLE_TYPE.AUTO,
};

export type UseWorker = <T extends (...funcArgs: any[]) => any>(
  func: T,
  options?: Options
) => {
  postMessage: (...funcArgs: Parameters<T>) => void;
  onMessage: (callBack: (e: MessageEvent) => void) => void;
  terminate: () => void;
  status: WorkerStatus;
};

/**
 * `useWorker` is a custom React hook that creates a web worker to run a given function.
 * This hook is useful for offloading computationally heavy tasks to a separate thread, preventing the main thread from blocking.
 *
 * @template T The type of the function to be executed in the web worker.
 * @param {T} func - The function to be executed in the web worker.
 * @param {Options} options - An optional parameter that includes options for the web worker such as timeout, remoteDependencies, autoTerminate, and transferable.
 * @returns {Object} - An object containing methods to interact with the web worker: postMessage, onMessage, terminate, and a status property.
 *
 * @example
 * ```jsx
 * import { useWorker } from './useWorker';
 *
 * function HeavyComputationComponent() {
 *   const heavyComputation = (num) => {
 *     let result = 0;
 *     for (let i = 0; i < num; i++) {
 *       result += Math.sqrt(i);
 *     }
 *     return result;
 *   };
 *
 *   const worker = useWorker(heavyComputation);
 *
 *   const handleClick = () => {
 *     worker.postMessage(1e7); // Perform heavy computation with 1e7 as argument
 *     worker.onMessage((e) => {
 *       console.log(e.data); // Log the result when it's ready
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleClick}>Start Computation</button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useWorker: UseWorker = <T extends (...funcArgs: any[]) => any>(
  func: T,
  options: Options = defaultOptions
): typeof workerHook => {
  const { autoTerminate, transferable, remoteDependencies, timeout } = {
    ...defaultOptions,
    ...options,
  };
  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>(WorkerStatus.IDLE);

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
