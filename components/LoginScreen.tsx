import React, { useState } from 'react';
import { Layout, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC<{ onJoin: (name: string) => void }> = ({ onJoin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onJoin(name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Layout className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CollabKanban</h1>
        <p className="text-gray-500 mb-8">Join the team workspace to start collaborating.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              autoFocus
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors flex items-center justify-center gap-2 group"
          >
            Enter Workspace
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <p className="mt-6 text-xs text-gray-400">
          Powered by Firestore (Simulated if no config)
        </p>
      </div>
    </div>
  );
};