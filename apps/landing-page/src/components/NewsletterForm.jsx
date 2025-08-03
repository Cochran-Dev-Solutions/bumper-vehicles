import React, { useState } from "react";
import { getApiUrl } from "../utils/config";

function NewsletterForm() {
  const [formData, setFormData] = useState({
    email: "",
    subscribe: false
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error message when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    
    try {
      const apiUrl = getApiUrl();
      
      // Step 1: Check if user is already subscribed using backend API
      console.log('Checking subscriber status for:', formData.email);
      const checkResponse = await fetch(`${apiUrl}/newsletter/check-subscriber`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (checkResponse.ok) {
        const subscriberCheck = await checkResponse.json();
        console.log('Subscriber check result:', subscriberCheck);
        
        if (subscriberCheck.exists && subscriberCheck.isConfirmed) {
          console.log('User is already subscribed, showing error');
          setErrorMessage('You are already subscribed to our newsletter with this email address.');
          return;
        }
      }
      
      console.log('User is not subscribed, proceeding with confirmation email');

      // Step 2: Send confirmation email via backend API
      const response = await fetch(`${apiUrl}/newsletter-confirmation-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (response.ok) {
        // Step 3: Redirect to waiting page
        window.location.href = `/waiting?type=newsletter&email=${encodeURIComponent(formData.email)}`;
        setFormData({ email: "", subscribe: false });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setErrorMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/30 rounded-lg p-8 border border-white/10">
      <h3 className="text-xl font-medium text-white mb-6">Stay Updated</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="subscribe"
            checked={formData.subscribe}
            onChange={handleInputChange}
            id="newsletter-subscribe"
            className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="newsletter-subscribe" className="text-white/80 text-sm">
            Subscribe to our newsletter for updates and exclusive content
          </label>
        </div>

        {errorMessage && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            {errorMessage}
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !formData.subscribe}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
        </button>
      </form>
    </div>
  );
}

export default NewsletterForm;
