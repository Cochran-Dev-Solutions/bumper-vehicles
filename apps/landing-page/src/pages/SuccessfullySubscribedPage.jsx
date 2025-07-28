import React from "react";

function SuccessfullySubscribedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-6 py-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Successfully Subscribed!</h1>
          <p className="text-gray-300 text-lg mb-6">
            Thank you for subscribing to our newsletter! You'll now receive updates about new features, 
            events, and exclusive content.
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Return to Home
          </a>
          
          <div className="pt-4">
            <a
              href="/beta-testing"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Get Beta Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessfullySubscribedPage; 