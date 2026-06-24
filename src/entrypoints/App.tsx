import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import Settings from '../components/Settings';
import { Icon } from '../shared/ui/Icon';

interface AppState {
  version: string;
  currentTime: string;
  isLoading: boolean;
  error: string | null;
  currentPage: 'home' | 'settings';
}

function App() {
  const [state, setState] = useState<AppState>({
    version: '',
    currentTime: '',
    isLoading: true,
    error: null,
    currentPage: 'home',
  });

  useEffect(() => {
    const initApp = async () => {
      try {
        const [version, currentTime] = await Promise.all([
          invoke<string>('get_app_version'),
          invoke<string>('get_current_time'),
        ]);
        setState(prev => ({
          ...prev,
          version,
          currentTime,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          version: '',
          currentTime: '',
          isLoading: false,
          error: String(error),
        }));
      }
    };

    initApp();
  }, []);

  const refreshTime = async () => {
    try {
      const currentTime = await invoke<string>('get_current_time');
      setState(prev => ({ ...prev, currentTime }));
    } catch (error) {
      console.error('Failed to get time:', error);
    }
  };

  const navigateTo = (page: 'home' | 'settings') => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  if (state.currentPage === 'settings') {
    return <Settings onBack={() => navigateTo('home')} />;
  }

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
          <div className="flex items-center gap-4">
            <div className="text-text-muted text-sm">
              v{state.version}
            </div>
            <button 
              onClick={() => navigateTo('settings')}
              className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
              title="设置"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Time Display */}
      <div className="bg-bg-card border-b border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-text-muted text-sm">
            系统时间: <span className="text-text font-mono">{state.currentTime}</span>
          </div>
          <button 
            onClick={refreshTime}
            className="text-primary hover:text-primary-dark text-sm transition-colors"
          >
            刷新时间
          </button>
        </div>
      </div>

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
              <button className="border border-border hover:border-primary px-4 py-2 rounded-lg transition-colors"
                onClick={() => navigateTo('settings')}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                <Icon name="file-text" size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Text Selection</h3>
              <p className="text-text-muted text-sm">
                Select text anywhere and trigger AI actions
              </p>
            </div>

            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-3">
                <Icon name="sparkles" size={24} className="text-success" />
              </div>
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <p className="text-text-muted text-sm">
                Translate, explain, summarize, and more
              </p>
            </div>

            <div className="bg-bg-card rounded-xl p-5 border border-border hover:border-primary transition-colors">
              <div className="w-10 h-10 bg-warning/20 rounded-lg flex items-center justify-center mb-3">
                <Icon name="settings" size={24} className="text-warning" />
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
