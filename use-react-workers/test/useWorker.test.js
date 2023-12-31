import React from 'react';
import { useWebWorker } from '../dist/index';
import { renderHook } from '@testing-library/react-hooks';

it('Runs successfully', async () => {
  const sum = (a, b) => a + b;
  const { result } = renderHook(() => useWebWorker(sum));
  const [sumWorker] = result.current;
  const res = await sumWorker(1, 2);
  assert.equal(res, 3);
});
