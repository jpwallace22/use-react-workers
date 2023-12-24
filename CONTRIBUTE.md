# Contributing

First off, thank you. Contributions and improvements are always welcome!

If you couldn't tell already `use-react-hooks` is a monorepo managed with a basic yarn workspaces.
There are currently three top-level packages (`examples`, `docs`, & `use-react-hooks`). All of the hooks go in
`use-react-hooks` and the examples package is for testing (though it might be removed in favor or just testing in docs).

Please ensure that any changes are also noted in the docs

## Setup

- Node -v 20.10.0 (`nvm use`)
- yarn (`npm install yarn -g`)
- install "node_modules" with (`yarn`)

## Dev

- run `yarn dev` on the root to concurrently run:
  - all of the hooks in watch mode
  - the example dev server
- open the example page on [port 5173](http://localhost:5173/)
- hack away

## Build

`yarn build`

## Debug

The `examples` project is linked to the `use-react-workers` build so you can test your changes immediately.
There is currently not a debugging environment set up.
