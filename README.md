<h1 align="center">
  use-react-workers - Reacts hooks for Web Workers
</h1>

## 🎨 Features

- Run expensive function **without blocking UI**
- Returns **Promise** instead of event-messages
- Strongly Typed
- Garbage collector web worker instance
- Options:
  - Timeout
  - Remote Deps
  - Terminate
- No required bundler

## 💻 [Installation](https://www.npmjs.com/package/use-react-workers)

```bash
# Yarn
yarn add use-react-workers

# npm
npm install use-react-workers
```

## Limitations

Web Workers have built in limitations. Before using this [hook](https://www.npmjs.com/package/use-react-workers), I HIGHLY recommend you to read the [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) documentation.

## 🔨 Import

There are currently three hooks in the package depending on your use-case. Either:

- `useWorkerFunc`
  - A function that runs in a web worker and returns a promise
- `useWorkerState`
  - A wrapper of useWorkerFunc that sets the return in state,
    provides a new setter function, and exposes the controls as well
- `useWorker`
  - A web worker as an object to quickly and easy post messages and
    use on `onmessage` subscription. Good for long running and constant
    updating workers

```jsx
import { useWorkerState, useWorkerFunc, useWorker } from 'use-react-workers';
```

## 🎬 Usage

#### useWorkerFunc

```tsx
import React from 'react';
import { useWorkerFunc } from 'use-react-workers';

// Heavy compute function
function fibonacci(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

const MyCoolComponent = () => {
  const [fibWorker] = useWorkerFunc(fibonacci);

  const handleClick = async () => {
    const result = await fibWorker(45); // Will not block the main thread
    console.log(result);
  };

  return (
    <div className="flex gap-4">
      <button type="button" onClick={handleClick}>
        Run With Worker
      </button>
      <button type="button" onClick={handleClick}>
        Run Without Worker
      </button>
    </div>
  );
};
```

#### useWorkerState

```tsx
import React from 'react';
import { useWorkerState } from 'use-react-workers';

// Heavy compute function
function fibonacci(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

const MyCoolComponent = () => {
  const defaultState = 0;
  const [fib, setFib] = useWorkerState(fibonacci, defaultState); // Will not block the main thread

  return (
    <div>
      <h1>{fib && fib}</h1>
      <button onClick={() => setFib(45)}>Fibonacci of 45</button>
    </div>
  );
};
```

#### useWorker

```tsx
import React from 'react';
import { useWorkerState } from 'use-react-workers';

// Long running function that we dont want blocked
export const countByInput = (countBy: 1 | 2 | 5) => {
  let seconds = countBy;
  setInterval(() => {
    postMessage(seconds);
    seconds += countBy;
  }, 1000);
};

const MyCoolComponent = () => {
  const timer = useWorker(countByInput); // Will not block the main thread

  timer.onMessage({ data } => console.log(data));

  return (
    <div>
      <button onClick={() => timer.postMessage(1)}>Count By 1</button>
      <button onClick={() => timer.postMessage(2)}>Count By 2</button>
      <button onClick={() => timer.postMessage(5)}>Count By 5</button>
      <button onClick={() => timer.terminate()}>End</button>
    </div>
  );
};
```

## 🔧 Roadmap

- [x] Kill Web Worker
- [x] Reactive web worker status
- [x] Add timeout option
- [x] Import and use remote script inside `use-react-workers` function
- [x] support [Transferable Objects](https://developer.mozilla.org/en-US/docs/Glossary/Transferable_objects)
- [ ] Import and use local script inside function
- [ ] Jest Testing suite
- [ ] Node env support

## 🧐 Motivation

Setting up Web workers isn't hard, but there is too much boilerplate and the syntax is annoying (in my opinion).
This is a great package if you just want to offload some heavy computation to a web worker
without having to go through the song and dance.

## 🌏 Contribute? Bug? New Feature?

The library is experimental so if you find a **bug** or would like to request a new **feature**, open an [issue](https://github.com/jpwallace22/use-react-workers/issues/new)

## 💡 Similar Projects

- [useWorker](https://github.com/alewin/useWorker)
  - This package is heavily influenced by this. So please, take some time to give it a star.

## 💻 Maintainers

- [@jpwallace22](https://github.com/jpwallace22)

## 💻 Contributors

_How to contribute?_

Read [CONTRIBUTE.md](docs/CONTRIBUTE.md)

## 📜 License

[MIT](https://github.com/jpwallace22/use-react-workers/LICENSE)
