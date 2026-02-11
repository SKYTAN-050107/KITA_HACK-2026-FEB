import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-kita-green mb-8">
        Vite + React + Tailwind
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg text-center">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-kita-blue hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600">
          Edit <code className="bg-gray-100 px-1 rounded">src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p className="mt-8 text-gray-500">
        Click on the logos to learn more
      </p>
    </div>
  )
}

export default App
