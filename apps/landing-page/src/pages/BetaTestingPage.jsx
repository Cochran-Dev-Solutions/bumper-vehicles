import React, { useState } from "react";
import { Layout } from "../components";
import { getApiUrl } from "../utils/config";

function BetaTestingPage() {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        
      // Proceed with beta signup (backend will handle all validation)
              const response = await fetch(`${apiUrl}/beta-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to PayPal payment
        window.location.href = data.approvalUrl;
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to create beta signup. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to create beta signup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Join the Beta Testing Program
            </h1>
            <p className="text-xl text-gray-300">
              Get early access to Bumper Vehicles and help shape the future of multiplayer racing!
            </p>
          </div>

          <div className="bg-black/30 rounded-lg p-8 border border-white/10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">Beta Testing Benefits</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="font-medium text-white mb-2">Early Access:</h3>
                  <ul className="space-y-2">
                    <li>• Play the game before public release</li>
                    <li>• Test new features and mechanics</li>
                    <li>• Provide direct feedback to developers</li>
                    <li>• Help shape the final game</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Exclusive Perks:</h3>
                  <ul className="space-y-2">
                    <li>• Beta tester badge and title</li>
                    <li>• Access to beta-only Discord channels</li>
                    <li>• Direct communication with dev team</li>
                    <li>• Recognition in game credits</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3">
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your first name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your last name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Beta Access Fee: $1.00</h3>
                <p className="text-gray-300 text-sm">
                  A small fee helps us verify serious beta testers and cover processing costs. 
                  You'll be redirected to PayPal to complete the payment securely.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>

            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>
                By joining the beta, you agree to provide feedback and report bugs. 
                Your email will be added to our newsletter for important updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BetaTestingPage; 