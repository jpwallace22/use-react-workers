import { useEffect, useState } from 'react';
import { Controller, useWorkerFunc } from './useWorkerFunc';

export type UseWorkerState = <
  R extends ReturnType<T>,
  T extends (args: any) => any = (args: any) => any
>(
  func: T,
  defaultState: R
) => [
  ReturnType<T> | null,
  (...args: Parameters<T>) => Promise<void>,
  Controller
];

/**
 * Executes a function in [useWorkerFunc](./useWorkerFunc) and retrieves its result in React state.
 * @param {T} func - The function to be executed in the web worker.
 * @param {ReturnType<T>} defaultState - The arguments to be passed to the function.
 * @returns {[ReturnType<T> | null, (input: Parameters<T>) => Promise<void>,  Controller]} - An array containing the result of the function and a controller object.
 */
export const useWorkerState: UseWorkerState = <
  R extends ReturnType<T>,
  T extends (args: any) => any = (args: any) => any
>(
  func: T,
  defaultState: R
): [
  ReturnType<T> | null,
  (...args: Parameters<T>) => Promise<void>,
  Controller
] => {
  const [result, setResult] = useState<R>(defaultState);
  const [workerFunc, controller] = useWorkerFunc(func);

  const setState = async (...args: Parameters<T>) => {
    const data = await workerFunc(...args);
    setResult(data);
  };

  useEffect(() => {
    return () => controller.terminate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [result, setState, controller];
};
