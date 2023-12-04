/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-globals */
import { TRANSFERABLE_TYPE } from '../useWorkerFunc';

interface JobRunnerOptions {
  fn: Function;
  transferable: TRANSFERABLE_TYPE;
}

/**
 * Accepts "userFunc" as a parameter and returns an anonymous function.
 * This anonymous function, accepts as arguments, the parameters to pass to
 * the function "useArgs" and returns a Promise
 *
 * Can be used as a wrapper only inside a Worker
 * because it depends by "postMessage".
 *
 * @param {Function} userFunc {Function} fn the function to run with web worker
 *
 * @returns {Function} returns a function that accepts the parameters
 * to be passed to the "userFunc" function
 */
const jobRunner =
  (options: JobRunnerOptions): ((e: MessageEvent) => Promise<void>) =>
  async (e: MessageEvent) => {
    const [userFuncArgs] = e.data as [any[]];
    try {
      const result = await Promise.resolve(options.fn(...userFuncArgs));
      const isTransferable = (val_1: any) =>
        ('ArrayBuffer' in self && val_1 instanceof ArrayBuffer) ||
        ('MessagePort' in self && val_1 instanceof MessagePort) ||
        ('ImageBitmap' in self && val_1 instanceof ImageBitmap) ||
        ('OffscreenCanvas' in self && val_1 instanceof OffscreenCanvas);
      const transferList: any[] =
        options.transferable === 'auto' && isTransferable(result)
          ? [result]
          : [];
      // @ts-ignore
      // Cannot use WorkerStatus Enum within the job runner until I figure
      // a better way to handle this, these will have to be magic strings.
      postMessage(['idle', result], transferList);
    } catch (error) {
      postMessage(['error', error]);
    }
  };

export default jobRunner;
