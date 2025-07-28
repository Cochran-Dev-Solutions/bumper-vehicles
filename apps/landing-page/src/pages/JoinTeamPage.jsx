import React, { useState } from "react";
import { Layout } from "../components";
import { getApiUrl } from "../utils/config";

function JoinTeamPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    expertise: "",
    message: ""
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    if (errorMessage) {
      setErrorMessage("");
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const apiUrl = getApiUrl();
        
              const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `Join Team Application - ${formData.expertise}`,
          message: `Expertise: ${formData.expertise}\n\nMessage: ${formData.message}`
        }),
      });

      if (response.ok) {
        setSuccessMessage("Thank you for your interest in joining our team! We'll review your application and get back to you soon.");
        setFormData({ name: "", email: "", expertise: "", message: "" });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to send application. Please try again.');
      }
    } catch (error) {
      setErrorMessage('Failed to send application. Please try again.');
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
              Join Our Team
            </h1>
            <p className="text-xl text-gray-300">
              Help us build the future of multiplayer racing games!
            </p>
          </div>

          <div className="bg-black/30 rounded-lg p-8 border border-white/10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4">We're Looking For</h2>
              <div className="grid md:grid-cols-2 gap-6 text-gray-300">
                <div>
                  <h3 className="font-medium text-white mb-2">Technical Roles:</h3>
                  <ul className="space-y-2">
                    <li>• Game Developers (JavaScript/Node.js)</li>
                    <li>• Frontend Developers (React)</li>
                    <li>• Backend Developers (Fastify/MySQL)</li>
                    <li>• Mobile Developers (React Native + Skia)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Creative Roles:</h3>
                  <ul className="space-y-2">
                    <li>• Game Art & Animation</li>
                    <li>• UI/UX Designers</li>
                    <li>• Social Media Managers (Discord, etc)</li>
                    <li>• Marketing Specialists</li>
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
              
              {successMessage && (
                <div className="bg-green-900/30 border border-green-500/50 rounded-md p-3">
                  <p className="text-green-300 text-sm">{successMessage}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                    disabled={isSubmitting}
                  />
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
              </div>

              <div>
                <label htmlFor="expertise" className="block text-sm font-medium text-gray-300 mb-2">
                  Area of Expertise
                </label>
                <select
                  name="expertise"
                  id="expertise"
                  value={formData.expertise}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select your expertise</option>
                  <option value="Game Development">Game Development</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="Game Art & Animation">Game Art & Animation</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Social Media Management">Social Media Management</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                  Why would you like to join our team?
                </label>
                <textarea
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Tell us about your experience, why you're interested in joining, and what you can bring to the team..."
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-6 rounded-md hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending Application..." : "Submit Application"}
              </button>
            </form>

            <div className="mt-8 text-center text-gray-400 text-sm">
              <p>
                We'll review your application and get back to you within a few days. 
                Please include any relevant portfolio links or GitHub profiles in your message.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default JoinTeamPage; 