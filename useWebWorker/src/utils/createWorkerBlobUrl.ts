import { TRANSFERABLE_TYPE } from '../useWebWorker';
import jobRunner from './jobRunner';
import { importScriptsFromDeps } from './importScriptsFromDeps';

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
const createWorkerBlobUrl = (
  fn: (args: any[]) => any,
  deps: string[],
  transferable: TRANSFERABLE_TYPE
) => {
  const blobCode = `
    ${importScriptsFromDeps(deps)};
    onmessage=(${jobRunner})({
      fn: (${fn}),
      transferable: '${transferable}'
    })
  `;
  const blob = new Blob([blobCode], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  return url;
};

export default createWorkerBlobUrl;
