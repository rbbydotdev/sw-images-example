import { useState } from "react";

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import tailwindLogo from './assets/tailwind.svg'

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex justify-center items-center gap-5 mb-5">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Vite logo" />
              <h1 className="text-4xl font-bold mt-4">Vite</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all animate-spin-slow" alt="React logo" />
              <h1 className="text-4xl font-bold mt-4">React</h1>
            </a>
            <p className="text-5xl font-semibold">+</p>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer">
              <img src={tailwindLogo} className="h-30 w-30 block align-middle hover:drop-shadow-lg transition-all" alt="Tailwind logo" />
              <h1 className="text-4xl font-bold mt-4">Tailwind</h1>
            </a>
          </div>
        </div>
        
        <div className="bg-gray-800 p-12 rounded-xl">
          <p className="text-7xl font-bold mb-8">{count}</p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setCount(count + 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              +
            </button>
            <button
              onClick={() => setCount(0)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-lg font-bold"
            >
              Reset
            </button>
            <button
              onClick={() => setCount(count - 1)}
              className="bg-gray-700 px-6 py-3 rounded-lg hover:bg-gray-600 text-2xl font-bold"
            >
              -
            </button>
          </div>
        </div>
        
        <p className="text-gray-500 text-base mt-8">
          Edit <code className="bg-gray-800 px-3 py-1 rounded">src/App.tsx</code> to get started
        </p>
      </div>
    </div>
  );
}
