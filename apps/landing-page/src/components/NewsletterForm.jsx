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
        
      // Subscribe to newsletter directly through our API (which handles ConvertKit)
              const response = await fetch(`${apiUrl}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email
        }),
      });

      if (response.ok) {
        window.location.href = `/waiting?type=newsletter&email=${encodeURIComponent(formData.email)}`;
        setFormData({ email: "", subscribe: false });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black/30 rounded-lg p-8 border border-white/10">
      <h3 className="text-xl font-medium text-white mb-6">Stay Updated</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3">
            <p className="text-red-300 text-sm">{errorMessage}</p>
          </div>
        )}
        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="newsletter-email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-500 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 px-3 py-2"
            placeholder="your@email.com"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="subscribe"
            id="subscribe"
            checked={formData.subscribe}
            onChange={handleInputChange}
            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800"
            required
            disabled={isSubmitting}
          />
          <label htmlFor="subscribe" className="ml-2 block text-sm text-gray-300">
            Subscribe to updates and announcements *
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Subscribing..." : "Subscribe to Newsletter"}
        </button>
      </form>
    </div>
  );
}

export default NewsletterForm;
