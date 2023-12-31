import { DependencyList, useCallback, useRef } from 'react';
import dequal from 'dequal';

/**
 * Like useCallback, but with deep equal comparison
 *
 * @param callback - The callback function to be memoized.
 * @param newDependencies - The dependencies that will trigger the re-memoization of the callback function.
 * @returns A memoized version of the callback function that will only be re-created if the dependencies change.
 */
export const useDeepCallback = <T extends (...args: any[]) => any>(
  callback: T,
  newDependencies: DependencyList
) => {
  const dependencies = useRef<DependencyList>(newDependencies);
  // @ts-expect-error dequal type resolutions
  const areDeepsEqual = dequal(dependencies.current, newDependencies);
  if (!areDeepsEqual) {
    dependencies.current = newDependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, dependencies.current);
};
