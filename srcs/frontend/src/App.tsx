import { useState } from 'react';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import './App.css';
import { isApiError } from '@appointment-saas/shared';

function App() {
  const [count, setCount] = useState(0);
  const [health, setHealth] = useState('');

  async function checkHealth(param: string) {
    const response = await fetch(`/api/health/${param}`);
    const body: unknown = await response.json();

    setHealth(isApiError(body) ? `${body.code}: ${body.message}` : JSON.stringify(body));
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
        <div>
          <button type="button" onClick={() => void checkHealth('ok')}>
            GET /api/health/ok
          </button>
          <button type="button" onClick={() => void checkHealth('nope')}>
            GET /api/health/nope
          </button>
          {health && <p>{health}</p>}
        </div>
      </section>

      <section id="spacer"></section>
    </>
  );
}

export default App;
