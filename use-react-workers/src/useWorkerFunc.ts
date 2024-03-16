import { useCallback, useEffect, useRef, useState } from 'react';
import createWorkerBlobUrl from './utils/createWorkerBlobUrl.ts';
import { useDeepCallback } from './utils/useDeepCallback.ts';
import { Options, TRANSFERABLE_TYPE, WorkerStatus } from './types.ts';

/** --TODO--
* 
* I might be able to wrap this with the `useWorker` and reduce the overall
* size of the library
* ---
* At the bare minimum, there is some repeated logic in here that could probably
* make separate modules.
*  
/** --TODO-- */

export interface Controller {
  status: WorkerStatus;
  terminate: () => void;
}

interface PromiseResponse {
  resolve: (result: any | ErrorEvent) => void;
  reject: (result: any) => void;
}

const defaultOptions = {
  timeout: undefined,
  remoteDependencies: [],
  autoTerminate: true,
  transferable: TRANSFERABLE_TYPE.AUTO,
};

const defaultPromise: PromiseResponse = {
  resolve: () => null,
  reject: () => null,
};

export type UseWorkerFunc = <T extends (...funcArgs: any[]) => any>(
  func: T,
  options?: Options
) => [(...funcArgs: Parameters<T>) => Promise<ReturnType<T>>, Controller];

/**
 * `useWorkerFunc` is a custom React hook that executes a given function in a web worker and returns a promise with its result.
 * This hook is useful for offloading computationally heavy tasks to a separate thread, preventing the main thread from blocking.
 *
 * @template T The type of the function to be executed in the web worker.
 * @param {T} func - The function to be executed in the web worker.
 * @param {Options} options - An optional parameter that includes options for the web worker such as timeout, remoteDependencies, autoTerminate, and transferable.
 * @returns {[(...funcArgs: Parameters<T>) => Promise<ReturnType<T>>, Controller]} - An array containing a function that when called with the arguments of the original function, returns a promise with the result, and a controller object to control the web worker.
 *
 * @example
 * ```jsx
 * import { useWorkerFunc } from './useWorkerFunc';
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
 *   const [compute, controller] = useWorkerFunc(heavyComputation);
 *
 *   const handleClick = async () => {
 *     const result = await compute(1e7); // Perform heavy computation with 1e7 as argument
 *     console.log(result);
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
export const useWorkerFunc: UseWorkerFunc = <T extends (...funcArgs: any[]) => any>(
  func: T,
  options: Options = defaultOptions
): [typeof workerHook, Controller] => {
  const { autoTerminate, transferable, remoteDependencies, timeout } = {
    ...defaultOptions,
    ...options,
  };

  const [workerStatus, setWorkerStatus] = useState<WorkerStatus>(WorkerStatus.IDLE);
  const worker = useRef<Worker & { _url?: string }>();
  const promise = useRef<PromiseResponse>(defaultPromise);
  const timeoutId = useRef<NodeJS.Timeout>();

  const killWorker = useCallback(() => {
    if (worker.current?._url) {
      worker.current.terminate();
      URL.revokeObjectURL(worker.current._url);
      promise.current = defaultPromise;
      worker.current = undefined;
      clearTimeout(timeoutId.current);
    }
  }, []);

  const onWorkerEnd = useCallback(
    (status: WorkerStatus) => {
      if (autoTerminate) {
        killWorker();
      }
      setWorkerStatus(status);
    },
    [autoTerminate, killWorker, setWorkerStatus]
  );

  const generateWorker = useDeepCallback(() => {
    const workerUrl = createWorkerBlobUrl(func, remoteDependencies, transferable);

    const webWorker: Worker & { _url?: string } = new Worker(workerUrl);
    webWorker._url = workerUrl;

    webWorker.onmessage = (e: MessageEvent) => {
      const [status, result] = e.data as [WorkerStatus, ReturnType<T>];

      switch (status) {
        case WorkerStatus.IDLE:
          promise.current.resolve(result);
          onWorkerEnd(WorkerStatus.IDLE);
          break;
        default:
          promise.current.reject(result);
          onWorkerEnd(WorkerStatus.ERROR);
          break;
      }
    };

    webWorker.onerror = (e: ErrorEvent) => {
      promise.current.reject(e);
      onWorkerEnd(WorkerStatus.ERROR);
    };

    if (timeout) {
      timeoutId.current = setTimeout(() => {
        killWorker();
        setWorkerStatus(WorkerStatus.EXPIRED);
      }, timeout);
    }

    return webWorker;
  }, [func, options, killWorker]);

  const callWorker = useCallback(
    (...workerArgs: Parameters<T>) => {
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
                  ('OffscreenCanvas' in window && val instanceof OffscreenCanvas)
              )
            : [];

        worker.current?.postMessage([[...workerArgs]], transferList);

        setWorkerStatus(WorkerStatus.RUNNING);
      });
    },
    [transferable]
  );

  const workerHook = useCallback(
    (...funcArgs: Parameters<T>) => {
      try {
        if (workerStatus === WorkerStatus.RUNNING) {
          throw new Error(
            '[useWorkerFunc] You can only run one instance of the worker at a time, if you want to run more than one in parallel, create another instance with the hook useWorkerFunc(). Read more: https://github.com/jpwallace22/use-react-workers'
          );
        }
        if (autoTerminate || !worker.current) {
          worker.current = generateWorker();
        }

        return callWorker(...funcArgs);
      } catch (e) {
        console.error(e);
        return Promise.reject(`Web worker "${func.name}" is already running`);
      }
    },
    [workerStatus, autoTerminate, callWorker, generateWorker, func]
  );

  const terminate = useCallback(() => {
    killWorker();
    setWorkerStatus(WorkerStatus.KILLED);
  }, [killWorker, setWorkerStatus]);

  const controller = {
    status: workerStatus,
    terminate,
  } satisfies Controller;

  useEffect(() => {
    killWorker();
  }, [killWorker]);

  return [workerHook, controller];
};
