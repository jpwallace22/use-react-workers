---
title: Overview
description: A quick glance at use react workers and what it offers
---

## React Workers

`use-react-workers` is a JavaScript library designed to leverage the [Web Worker Web API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) seamlessly within [React](https://react.dev/) Hooks. It empowers you to execute **resource-intensive functions** without stalling the user interface. Its straightforward syntax, utilization of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise), and multiple hooks ensures a smooth user AND developer experience.

## Features

- Ability to run compute heavy functions **without blocking UI**
- Returns **Promise** instead of event-messages (for certain hooks)
- Bundler agnostic
- Strongly Typed (Typescript first)
- Built in clean up and garbage collection

## Vanilla Web Worker

```ts
// webworker.ts
self.onmessage(e => {
  const addDigits = (num1: number, num2: number) => num1 + num2;
  const result = addDigits(...e.data);
  postMessage(result);
});
```

```ts
// addition.ts

const worker = new Worker('./webworker.ts');
worker.postMessage([2, 2]); // no type safety 😪

worker.onmessage(e => {
  console.log('2 + 2 = ', e.data); // 2 + 2 = 4
});

useEffect(() => {
  return () => worker.terminate();
});
```

## Using a Worker Hook

```ts
// addition.ts
const addDigits = (num1: number, num2: number) => num1 + num2;
const [addWorker] = useWorkerFunc(addDigits);

const result = await addWorker(2, 2); // type safe 😎
console.log('2 + 2 = ', result); // 2 + 2 = 4
```
