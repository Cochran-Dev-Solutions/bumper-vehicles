import React from "react";
import { getGameUrl } from "../utils/config";

function BetaCredentialsPage() {
  // Get credentials from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  const password = urlParams.get('password');
  const email = urlParams.get('email');

  const gameUrl = getGameUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to Beta Access!</h1>
          <p className="text-gray-300 text-lg mb-6">
            Your payment was successful! Here are your login credentials. 
            An email has also been sent to {email} with these details.
          </p>
        </div>
        
        <div className="bg-black/30 rounded-lg p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Your Login Credentials</h2>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={username || 'Loading...'}
                  readOnly
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(username || '')}
                  className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={password || 'Loading...'}
                  readOnly
                  className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-600"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(password || '')}
                  className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-2 rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <a
            href={gameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Play Bumper Vehicles Now
          </a>
          
          <div className="pt-4">
            <a
              href="/"
              className="inline-block border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-sm text-yellow-300">
            <strong>Important:</strong> Keep these credentials safe! You'll need them to log into the game. 
            If you lose them, contact us at info@bumpervehicles.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default BetaCredentialsPage; 