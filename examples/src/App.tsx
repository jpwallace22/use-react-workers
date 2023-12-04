import { useEffect } from 'react';
import { useWebWorker, useWorkerFunc } from 'react-worker-hooks';
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
  const [fibNumber] = useWebWorker(fib, 45);

  useEffect(() => {
    const loopInterval = setInterval(infiniteLoop, 100);
    return () => clearInterval(loopInterval);
  }, []);

  const alertFib = () => {
    fib(45);
    alert('Done');
  };
  const alertWorker = async () => {
    await fibWorker(45);
    alert('Done');
  };

  return (
    <>
      <div>
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>
      <h1>useWebWorker()</h1>
      <div className="card">
        <button onClick={alertFib} style={{ marginRight: '16px' }}>
          Without Worker
        </button>
        <button onClick={alertWorker}>With Worker</button>
        <p>
          <strong>Worker Status:</strong> {status}
        </p>
        <p>Fib number: {fibNumber} </p>
      </div>
    </>
  );
}

export default App;
