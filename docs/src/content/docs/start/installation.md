---
title: Getting Started with use-react-workers
description: A quick glance at use react workers and what it offers
---

The library is published and distributed via [NPM](https://www.npmjs.com/package/use-react-workers)

Before you start, ensure you have the following prerequisites:

:::tip[Prerequisites]

- **Node.js**: You need to have Node.js version 14 or higher installed on your system. You can download it from the [official Node.js website](https://nodejs.org/en).

- **React.js**: `use-react-workers` is a React library, so you need to have React.js version 16 or higher in your project.

  :::

## Installation

Choose your flavor of package manager and install as normal. A few examples:

Yarn

```bash
yarn add use-react-workers
```

pnpm

```bash
pnpm add use-react-workers
```

npm

```bash
npm install use-react-workers
```

## Importing

`use-react-workers` provides several hooks, functions, and types as named exports. You can import them directly into your files like this:

```ts
import { useWorkerFunc } from 'use-react-workers';
```

With `use-react-workers`, you can significantly enhance your application's performance by running heavy tasks in the background, without blocking the UI. It's a great tool to have in your React toolkit.
