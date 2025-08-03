import React, { useEffect, useState } from "react";
import { getApiUrl } from "../utils/config";

function SuccessfullySubscribedPage() {
  const [subscriptionStatus, setSubscriptionStatus] = useState('loading');
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    setEmail(emailParam || '');

    if (emailParam) {
      // Add subscriber to ConvertKit via backend API
      const addToConvertKit = async () => {
        try {
          console.log('Adding subscriber to ConvertKit:', emailParam);
          const apiUrl = getApiUrl();
          
          const result = await fetch(`${apiUrl}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailParam
            }),
          });

          if (result.ok) {
            const data = await result.json();
            console.log('Successfully added to ConvertKit:', data);
            setSubscriptionStatus('success');
          } else {
            const errorData = await result.json();
            console.error('Failed to add to ConvertKit:', errorData.error);
            setSubscriptionStatus('error');
          }
        } catch (error) {
          console.error('Error adding to ConvertKit:', error);
          setSubscriptionStatus('error');
        }
      };

      addToConvertKit();
    } else {
      setSubscriptionStatus('no-email');
    }
  }, []);

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
          
          {subscriptionStatus === 'loading' && (
            <p className="text-gray-300 text-lg mb-6">
              Completing your subscription...
            </p>
          )}
          
          {subscriptionStatus === 'success' && (
            <p className="text-gray-300 text-lg mb-6">
              Thank you for subscribing to our newsletter! You'll now receive updates about new features, 
              events, and exclusive content.
            </p>
          )}
          
          {subscriptionStatus === 'error' && (
            <div className="mb-6">
              <p className="text-gray-300 text-lg mb-2">
                Thank you for subscribing to our newsletter!
              </p>
              <p className="text-yellow-300 text-sm">
                Note: There was an issue adding you to our mailing list, but we've recorded your subscription.
              </p>
            </div>
          )}
          
          {subscriptionStatus === 'no-email' && (
            <p className="text-gray-300 text-lg mb-6">
              Thank you for subscribing to our newsletter! You'll now receive updates about new features, 
              events, and exclusive content.
            </p>
          )}
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