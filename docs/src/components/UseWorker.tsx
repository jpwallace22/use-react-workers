import { useEffect, useState } from 'react';
import { useWorker } from 'use-react-workers';
import react from '../assets/react.svg';

let turn = 0;
function infiniteLoop() {
  const logo = document.querySelector<HTMLElement>('.logo');
  turn += 2;
  if (logo) logo.style.transform = `rotate(${turn % 360}deg)`;
}

export function UseWorker() {
  const [count, setCount] = useState(0);
  const timerWorker = useWorker(timer);

  timerWorker.onMessage(({ data }) => setCount(data));

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
          <strong>Count:</strong> {count}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            className="btn primary"
            onClick={() => {
              timerWorker.terminate();
              timerWorker.postMessage(2);
            }}
          >
            Count by 2
          </button>
          <button
            className="btn primary"
            onClick={() => {
              timerWorker.terminate();
              timerWorker.postMessage(5);
            }}
          >
            Count by 5
          </button>
          <button className="btn" onClick={() => timerWorker.terminate()}>
            Stop Timer
          </button>
        </div>
        <p>
          <strong>Worker Status:</strong> {timerWorker.status}
        </p>
      </div>
    </div>
  );
}

export const timer = (countBy: 2 | 5) => {
  let seconds = countBy;
  setInterval(() => {
    postMessage(seconds);
    seconds += countBy;
  }, 1000);
};
