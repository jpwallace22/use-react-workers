/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-restricted-globals */

import { importScriptsFromDeps } from './importScriptsFromDeps.ts';

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
export const createPersistentBlobUrl = (fn: (args: any[]) => any, deps: string[]) => {
  const blobCode = `
    ${importScriptsFromDeps(deps)};
    onmessage=(${jobRunner})({
      fn: ${fn},
    })
  `;

  const blob = new Blob([blobCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

interface JobRunnerOptions {
  fn: Function;
}

// TODO
// Need to rethink this runner logic. It works well for single actions, but makes
// repeated actions impossible due to closure. It will recreate the functions and rerun
// every time instead of effecting internal state of the function
const jobRunner =
  ({ fn }: JobRunnerOptions): ((e: MessageEvent) => Promise<void>) =>
  async (e: MessageEvent) => {
    const [userFuncArgs] = e.data as [any[]];
    fn(...userFuncArgs);
  };
