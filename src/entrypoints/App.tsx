import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface AppState {
  version: string;
  isLoading: boolean;
  error: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    version: '',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        const version = await invoke<string>('get_app_version');
        setState({
          version,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState({
          version: '',
          isLoading: false,
          error: String(error),
        });
      }
    };

    initApp();
  }, []);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-primary text-xl">Loading AIction...</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-danger text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold">AIction</h1>
          </div>
          <div className="text-text-muted text-sm">
            v{state.version}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-bg-card rounded-xl p-6 mb-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">Welcome to AIction</h2>
            <p className="text-text-muted mb-4">
              A lightweight AI + Actions efficiency tool. Select text, trigger actions, and get AI assistance.
            </p>
            <div className="flex gap-3">
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                Get Started
              </button>
              <button className="border border-border hover:border-primary px-4 py-2 rounded-lg transition-colors">
                Settings
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-primary text-xl">📝</span>
              </div>
              <h3 className="font-semibold mb-2">Text Selection</h3>
              <p className="text-text-muted text-sm">
                Select text anywhere and trigger AI actions
              </p>
            </div>

            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-success text-xl">⚡</span>
              </div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <p className="text-text-muted text-sm">
                Translate, explain, summarize, and more
              </p>
            </div>

            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center mb-3">
                <span className="text-warning text-xl">⚙️</span>
              </div>
              <h3 className="font-semibold mb-2">Custom Actions</h3>
              <p className="text-text-muted text-sm">
                Create your own AI-powered actions
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
