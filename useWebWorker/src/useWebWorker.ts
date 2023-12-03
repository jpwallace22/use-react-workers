import { useEffect, useState } from 'react';
import {
  WorkerController,
  useWorkerFunc,
} from 'useWebWorker/src/useWorkerFunc';

export const useWebWorker = <T extends (args: any) => any>(
  func: T,
  ...args: Parameters<T>
): [ReturnType<T> | null, WorkerController] => {
  const [result, setResult] = useState<ReturnType<T> | null>(null);
  const [workerFunc, workerController] = useWorkerFunc(func);

  useEffect(() => {
    (async () => {
      const data = await workerFunc(...args);
      setResult(data);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [result, workerController];
};
