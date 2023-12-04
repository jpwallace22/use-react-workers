import { useEffect, useState } from 'react';
import { Controller, useWorkerFunc } from './useWorkerFunc';

/**
 * Executes a function in [useWorkerFunc](./useWorkerFunc) and retrieves its result in React state.
 * @param {T} func - The function to be executed in the web worker.
 * @param {...Parameters<T>} args - The arguments to be passed to the function.
 * @returns {[ReturnType<T> | null, Controller]} - An array containing the result of the function and a controller object.
 */
export const useWebWorker = <T extends (args: any) => any>(
  func: T,
  ...args: Parameters<T>
): [ReturnType<T> | null, Controller] => {
  const [result, setResult] = useState<ReturnType<T> | null>(null);
  const [workerFunc, controller] = useWorkerFunc(func);

  useEffect(() => {
    (async () => {
      const data = await workerFunc(...args);
      setResult(data);
    })();

    return () => controller.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [result, controller];
};
