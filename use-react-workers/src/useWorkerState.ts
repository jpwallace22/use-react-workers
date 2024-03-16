import { useEffect, useState } from 'react';
import { Controller, useWorkerFunc } from './useWorkerFunc.ts';

export type UseWorkerState = <R extends ReturnType<T>, T extends (args: any) => any = (args: any) => any>(
  func: T,
  defaultState: R
) => [ReturnType<T> | null, (...args: Parameters<T>) => Promise<void>, Controller];

/**
 * `useWorkerState` is a custom React hook that executes a given function in a web worker and retrieves its result in a React state.
 * This hook is useful for offloading computationally heavy tasks to a separate thread, preventing the main thread from blocking.
 *
 * @template R The type of the return value of the function `func`.
 * @template T The type of the function to be executed in the web worker.
 * @param {T} func - The function to be executed in the web worker.
 * @param {R} defaultState - The initial state value.
 * @returns {[ReturnType<T> | null, (...args: Parameters<T>) => Promise<void>, Controller]} - An array containing the result of the function, a function to set the state, and a controller object to control the web worker.
 *
 * @example
 * ```jsx
 * import { useWorkerState } from './useWorkerState';
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
 *   const [result, setResult, controller] = useWorkerState(heavyComputation, 0);
 *
 *   const handleClick = () => {
 *     setResult(1e7); // Perform heavy computation with 1e7 as argument
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleClick}>Start Computation</button>
 *       {result && <p>Result: {result}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export const useWorkerState: UseWorkerState = <
  R extends ReturnType<T>,
  T extends (args: any) => any = (args: any) => any,
>(
  func: T,
  defaultState: R
): [ReturnType<T> | null, (...args: Parameters<T>) => Promise<void>, Controller] => {
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
