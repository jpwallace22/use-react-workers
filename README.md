<h1 align="center">
  useWebWorker: A React hook WebWorker
</h1>

---

## 🎨 Features

- Run expensive function **without blocking UI** ([Show live gif](https://github.com/jpwallace22/useWebWorker/issues/2))
- Supports **Promises** pattern instead of event-messages
- Size: less than `3KB`!
- Clear [API](https://useWebworker.js.org/docs/api-useWebworker#options-api) using hook
- Typescript support
- Garbage collector web worker instance
- [Remote dependencies](https://useWebworker.js.org/docs/api-useWebworker#options-api) option
- [timeout](https://useWebworker.js.org/docs/api-useWebworker#options-api) option

---

## 💾 [Install](https://www.npmjs.com/package/@koale/useWebworker)

- **@latest**

```bash
# Yarn
yarn add useWebworker

# npm
npm install useWebworker
```

---

## 🔨 Import

```jsx
import { useWebWorker } from 'useWebworker';
```

---

## 📙 Documents

- [Getting Started](https://useWebworker.netlify.com/docs/introduction/)
- [APIs](https://useWebworker.netlify.com/docs/api-useWebworker)
- [Examples](https://useWebworker.netlify.com/docs/examples/examples-sort)
- [Limitations](https://useWebworker.netlify.com/docs/limitations)

---

## 🍞 Demo

- [Sorting](https://icji4.csb.app/sorting): Sorting 50000 random numbers
- [Csv](https://icji4.csb.app/csv): Generate Csv, Parse Csv, Convert to JSON
- [External Dependencies](https://icji4.csb.app/external) Use external scripts inside WebWorker

---

## ⚙ Web Workers

Before you start using this [hook](https://www.npmjs.com/package/@koale/useWebworker), I suggest you to read the [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) documentation.

---

## 🐾 Usage

```jsx
import React from 'react';
import { useWebWorker } from 'useWebWorker';

const numbers = [...Array(5000000)].map(e => ~~(Math.random() * 1000000));
const sortNumbers = nums => nums.sort();

const Example = () => {
  const [sortWorker] = useWebWorker(sortNumbers);

  const runSort = async () => {
    const result = await sortWorker(numbers); // non-blocking UI
    console.log(result);
  };

  return (
    <button type="button" onClick={runSort}>
      Run Sort
    </button>
  );
};
```

---

## 🖼 Live Demo

<img alt="useWebworker demo" src="https://user-images.githubusercontent.com/980844/82120716-70151e00-9788-11ea-8f8d-07b06a13dde2.gif" />

---

## 🐾 Examples

[![Edit white-glitter-icji4](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/white-glitter-icji4?fontsize=14&hidenavigation=1&theme=dark)

More examples: https://github.com/jpwallace22/useWebWorker/tree/develop/example

---

## 🔧 Roadmap

- [x] Kill Web Worker
- [x] Reactive web worker status
- [x] Add timeout option
- [x] Import and use remote script inside `useWebWorker` function
- [x] support [Transferable Objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects)
- [x] Testing useWebWorker [#41](https://github.com/jpwallace22/useWebWorker/issues/41)
- [x] Import and use local script inside `useWebWorker` function [#37](https://github.com/jpwallace22/useWebWorker/issues/37)
- [ ] useWebWorkers Hook [#38](https://github.com/jpwallace22/useWebWorker/issues/38)
- [ ] useWebWorkerFile Hook [#93](https://github.com/jpwallace22/useWebWorker/issues/93)

---

## 🤔 Motivation and Limitations

Most react projects are initialized through [Create React App](https://github.com/facebook/create-react-app).
CRA unfortunately does not offer support for webworkers, unless you eject and change the webpack configuration manually.

This library allows you to use web workers without having to change the CRA configuration, which is why there are often limitations or particular workarounds.

If you are interested in changing the webpack configuration to manually manage your workers, see: [worker-loader](https://github.com/webpack-contrib/worker-loader)

---

## Known issues

There's a known issue related to transpiling tools such as Babel causing `Not refereced` errors.

Since the approach of this library is moving the entire function passed to the Hook to a worker, if the function gets transpiled, variable definitions used by the transpiling tool may get out of scope when the function gets moved to the worker, causing unexpected reference errors.

If you're experimenting this type of issue, one workaround is wrapping your function declaration inside a function object as a string.

```js
const sum = new Function(`a`, `b`, `return a + b`);
```

---

## 🌏 Contribute? Bug? New Feature?

The library is experimental so if you find a **bug** or would like to request a new **feature**, open an [issue](https://github.com/jpwallace22/useWebWorker/issues/new)

---

## 💡 Similar Projects

- [greenlet](https://github.com/developit/greenlet/)
- [react-hooks-worker](https://github.com/dai-shi/react-hooks-worker)

---

## 💻 Mantainers

- [@zant](https://github.com/zant)
- [@jpwallace22](https://github.com/jpwallace22)

## 💻 Contributors

- Thanks to:
- [@zant](https://github.com/zant) (test, CI, `RFC`, bugfixes, `localdependencies` feature, ...)
- [@101arrowz](https://github.com/101arrowz) ( `isoworker` packages proposal )
- [@z4o4z](https://github.com/z4o4z) (`Typescript` implementation, Discussion of `RFC`)
- [@IljaDaderko](https://github.com/IljaDaderko) (`Typescript` support, Discussion of `RFC`)
- [@ophirg](https://github.com/ophirg) (`Typescript` support)
- [@Pigotz](https://github.com/Pigotz) (Discussion of `RFC`)
- [@gubo97000](https://github.com/gubo97000) (Fix [#108](https://github.com/jpwallace22/useWebWorker/issues/108))

_How to contribute?_

Read [CONTRIBUTE.md](docs/CONTRIBUTE.md)

---

## 📜 License

[MIT](https://github.com/jpwallace22/useWebWorker/blob/develop/LICENSE)

---

[![Netlify Status](https://api.netlify.com/api/v1/badges/833cd6b2-6e74-47f0-aa85-5f14aea8ea35/deploy-status)](https://app.netlify.com/sites/useWebworker/deploys)
