import { useState } from "react";
import { greet, getVersion } from "~/api/tauri";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");

  async function handleGreet() {
    setGreetMsg(await greet(name));
  }

  async function handleGetVersion() {
    setVersion(await getVersion());
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AIction Desktop
        </h1>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Tauri v2 + React + TypeScript</p>
            <button
              onClick={handleGetVersion}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              获取版本
            </button>
            {version && (
              <p className="mt-2 text-sm text-gray-500">版本: {version}</p>
            )}
          </div>

          <div className="border-t pt-6">
            <form
              className="flex gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleGreet();
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder="输入名称..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                打招呼
              </button>
            </form>
            {greetMsg && (
              <p className="mt-4 text-center text-gray-700">{greetMsg}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
