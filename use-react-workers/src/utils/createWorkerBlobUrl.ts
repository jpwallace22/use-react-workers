/* eslint-disable no-restricted-globals */
import { importScriptsFromDeps } from './importScriptsFromDeps.ts';
import { TRANSFERABLE_TYPE } from 'use-react-workers/src/types.ts';

/**
 * Builds a web worker out of the function
 *
 * @param {Function} fn the function to run with web worker
 * @param {Array.<String>} deps array of strings, imported into the worker through "importScripts"
 *
 * @returns {String} a blob url, containing the code of "fn" as a string
 *
 * @example
 * createWorkerBlobUrl((a,b) => a+b, [])
 * // return "onmessage=return Promise.resolve((a,b) => a + b)
 * .then(postMessage(['IDLE', result]))
 * .catch(postMessage(['ERROR', error])"
 */
const createWorkerBlobUrl = (fn: (args: any[]) => any, deps: string[], transferable: TRANSFERABLE_TYPE) => {
  const blobCode = `
    ${importScriptsFromDeps(deps)};
    onmessage=(${jobRunner})({
      fn: ${fn},
      transferable: '${transferable}'
    })
  `;

  const blob = new Blob([blobCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

export default createWorkerBlobUrl;

interface JobRunnerOptions {
  // eslint-disable-next-line @typescript-eslint/ban-types
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
export const jobRunner =
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

      const transferList: any[] = options.transferable === 'auto' && isTransferable(result) ? [result] : [];

      // @ts-ignore
      // Cannot use WorkerStatus Enum within the job runner until I figure
      // a better way to handle this, these will have to be magic strings.
      postMessage(['idle', result], transferList);
    } catch (error) {
      postMessage(['error', error]);
    }
  };
