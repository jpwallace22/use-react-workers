/**
 * Concatenates the remote dependencies into a comma separated string.
 * This string will then be passed as an argument to the "importScripts" function.
 *
 * @param {Array.<String>} deps - An array of strings representing the dependencies.
 * @returns {String} A string composed of the concatenated dependencies wrapped in `importScripts()` function.
 *
 * @example
 * importScriptsFromDeps(['http://js.com/1.js', 'http://js.com/2.js'])
 * // importScripts('http://js.com/1.js', 'http://js.com/2.js')
 */
export const importScriptsFromDeps = (deps: string[]): string => {
  if (deps.length === 0) return '';

  const depsString = deps.map(dep => `'${dep}'`).toString();
  return `importScripts(${depsString})`;
};
