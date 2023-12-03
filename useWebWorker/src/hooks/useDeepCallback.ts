import { DependencyList, useCallback, useRef } from 'react';
import dequal from 'dequal';

export const useDeepCallback = <T extends (...args: any[]) => any>(
  callback: T,
  newDependencies: DependencyList
) => {
  const dependencies = useRef<DependencyList>(newDependencies);
  const areDeepsEqual = dequal(dependencies.current, newDependencies);
  if (!areDeepsEqual) {
    dependencies.current = newDependencies;
  }

  return useCallback(callback, dependencies.current);
};
