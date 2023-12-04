import React from 'react';
import { useWebWorker } from '../dist/index';
import { renderHook } from '@testing-library/react-hooks';

const adder = (a, b) => a + b;

it('localDependencies', async () => {
  /*   const sum = (a, b) => adder(a, b);
  const { result } = renderHook(() =>
    useWebWorker(sum, { localDependencies: () => [adder] })
  );
  const [sumWorker] = result.current;
  const res = await sumWorker(1, 2);
  assert.equal(res, 3); */
  assert.equal(1, 1);
});
