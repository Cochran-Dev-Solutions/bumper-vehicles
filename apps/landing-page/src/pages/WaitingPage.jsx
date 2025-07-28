import React from 'react';

const WaitingPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get('type'); // 'newsletter' or 'beta'
  const email = urlParams.get('email');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email!</h1>
            <p className="text-gray-300 text-lg mb-6">
              We've sent a verification email to:
            </p>
            <p className="text-cyan-400 font-mono text-lg mb-8">{email}</p>
            
            {type === 'beta' ? (
              <div className="space-y-4">
                <p className="text-gray-300">
                  You'll receive <strong>two emails</strong>:
                </p>
                <div className="bg-gray-800/50 rounded-lg p-4 text-left">
                  <ul className="text-gray-300 space-y-2">
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">1.</span>
                      <span>A verification email to confirm your newsletter subscription</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-cyan-400 mr-2">2.</span>
                      <span>An email with your beta access credentials</span>
                    </li>
                  </ul>
                </div>
                <p className="text-gray-300 text-sm">
                  Please check your spam folder if you don't see the emails in your inbox.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300">
                  Please check your email and click the verification link to complete your subscription.
                </p>
                <p className="text-gray-300 text-sm">
                  Don't forget to check your spam folder if you don't see the email in your inbox.
                </p>
                <p className="text-gray-300 text-sm">
                  After verification, you'll be redirected to our success page.
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage; 