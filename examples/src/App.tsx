import { useEffect, useState } from 'react';
import { useWorkerState, useWorker, useWorkerFunc } from 'use-react-workers';
import './App.css';
import reactLogo from './assets/react.svg';

function fib(n: number): number {
  return n <= 1 ? n : fib(n - 1) + fib(n - 2);
}

let turn = 0;
function infiniteLoop() {
  const logo = document.querySelector<HTMLElement>('.logo');
  turn += 2;
  if (logo) logo.style.transform = `rotate(${turn % 360}deg)`;
}

function App() {
  const [fibWorker, { status }] = useWorkerFunc(fib);
  const [fibNumber, setFibNumber, { status: stateStatus }] = useWorkerState(fib, 10);
  const timerWorker = useWorker(timer);

  const [time, setTime] = useState(0);
  const [funcFib, setFuncFib] = useState(0);

  useEffect(() => {
    const loopInterval = setInterval(infiniteLoop, 100);
    return () => clearInterval(loopInterval);
  }, []);

  timerWorker.onMessage(e => setTime(e.data));

  return (
    <>
      <div>
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>Use React Workers</h1>

      <div className="card">
        <h3>useWorkerFunc()</h3>
        <p>
          <strong>Fib Number:</strong> {funcFib}
        </p>
        <button
          onClick={() => {
            setFuncFib(0);
            setTimeout(() => setFuncFib(fib(45)), 1);
          }}
          style={{ marginRight: '16px' }}
        >
          Without Worker
        </button>
        <button
          onClick={async () => {
            setFuncFib(0);
            setFuncFib(await fibWorker(45));
          }}
        >
          With Worker
        </button>
        <p>
          <strong>Worker Status:</strong> {status}
        </p>
      </div>

      <div className="card">
        <h3>useWorker()</h3>
        <p>
          <strong>Timer:</strong> {time}
        </p>
        <button onClick={() => timerWorker.postMessage(1)} style={{ marginRight: '16px' }}>
          Count by 1
        </button>
        <button onClick={() => timerWorker.postMessage(2)} style={{ marginRight: '16px' }}>
          Count by 2
        </button>
        <button onClick={() => timerWorker.terminate()}>Stop Timer</button>
        <p>
          <strong>Worker Status:</strong> {timerWorker.status}
        </p>
      </div>

      <div className="card">
        <h3>useWorkerState()</h3>
        <p>
          <strong>Current State:</strong> {fibNumber}
        </p>
        <button onClick={() => setFibNumber(20)} style={{ marginRight: '16px' }}>
          Fib 20
        </button>
        <button onClick={() => setFibNumber(45)} style={{ marginRight: '16px' }}>
          Fib 45
        </button>
        <button onClick={() => timerWorker.terminate()}>Stop Timer</button>
        <p>
          <strong>Worker Status:</strong> {stateStatus}
        </p>
      </div>
    </>
  );
}

export default App;

export const timer = (countBy: 1 | 2 | 5) => {
  let seconds = countBy;
  setInterval(() => {
    postMessage(seconds);
    seconds += countBy;
  }, 1000);
};
