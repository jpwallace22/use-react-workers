import { useEffect, useState } from 'react';
import { useWorkerState } from 'use-react-workers';
import react from '../assets/react.svg';

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

let turn = 0;
function infiniteLoop() {
  const logo = document.querySelector<HTMLElement>('.logo');
  turn += 2;
  if (logo) logo.style.transform = `rotate(${turn % 360}deg)`;
}

export function UseWorkerState() {
  const [calcNum, setCalcNum] = useState(0);
  const [fibNum, setFibNum, { status }] = useWorkerState(fib, 0);

  useEffect(() => {
    const loopInterval = setInterval(infiniteLoop, 100);
    return () => clearInterval(loopInterval);
  }, []);

  return (
    <div className="not-content my-8 mx-auto w-fit text-center">
      <div>
        <img
          src={react.src}
          className="logo react w-80 mb-8"
          alt="React logo"
        />
      </div>

      <div className="grid gap-4">
        <p>
          <strong>Fib Number:</strong> {fibNum}
        </p>
        <div className="flex gap-4 justify-center">
          <input
            type="number"
            value={calcNum}
            onChange={({ target }) => setCalcNum(Number(target.value))}
          />
          <button className="btn primary" onClick={() => setFibNum(calcNum)}>
            Calc new state
          </button>
        </div>
        <p>
          <strong>Worker Status:</strong> {status}
        </p>
      </div>
    </div>
  );
}
