import { useEffect, useState } from 'react';
import { useWorkerFunc } from 'use-react-workers';
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

export function UseWorkerFunc() {
  const [fibNum, setFibNum] = useState(0);
  const [fibWorker, { status }] = useWorkerFunc(fib);

  useEffect(() => {
    const loopInterval = setInterval(infiniteLoop, 100);
    return () => clearInterval(loopInterval);
  }, []);

  return (
    <div className="not-content my-8 mx-auto w-fit text-center">
      <div>
        <img src={react.src} className="logo react w-80 mb-8" alt="React logo" />
      </div>

      <div className="grid gap-4">
        <p>
          <strong>Fib Number:</strong> {fibNum}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="btn"
            onClick={() => {
              setFibNum(0);
              setTimeout(() => setFibNum(fib(45)), 1);
            }}
          >
            Without Worker
          </button>
          <button
            className="btn primary"
            onClick={async () => {
              setFibNum(0);
              setFibNum(await fibWorker(45));
            }}
          >
            With Worker
          </button>
        </div>
        <p>
          <strong>Worker Status:</strong> {status}
        </p>
      </div>
    </div>
  );
}
