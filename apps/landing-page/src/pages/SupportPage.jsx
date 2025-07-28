import React from "react";
import { Link } from "react-router-dom";
import { Layout, KoFiButton } from "../components";

function SupportPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Bumper Vehicles</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Help us continue development and bring Bumper Vehicles to more players worldwide. 
            Your support makes a real difference!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Ko-Fi Support */}
          <div className="bg-black/30 rounded-lg p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.881 8.814c-.772 0-1.363.562-1.363 1.248 0 .709.591 1.248 1.363 1.248C24.431 11.31 25 10.771 25 10.062c0-.686-.569-1.248-1.119-1.248zM14.956 12.747c0-.709.591-1.248 1.363-1.248.772 0 1.363.562 1.363 1.248 0 .709-.591 1.248-1.363 1.248-.772 0-1.363-.562-1.363-1.248zM7.881 12.747c0-.709.591-1.248 1.363-1.248.772 0 1.363.562 1.363 1.248 0 .709-.591 1.248-1.363 1.248-.772 0-1.363-.562-1.363-1.248zM.881 12.747c0-.709.591-1.248 1.363-1.248.772 0 1.363.562 1.363 1.248 0 .709-.591 1.248-1.363 1.248-.772 0-1.363-.562-1.363-1.248z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Current Funding</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              We're currently raising funds through Ko-Fi to support ongoing development, 
              server costs, and feature expansion. Every contribution helps!
            </p>
            
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-red-300 mb-2">What your support funds:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Server infrastructure and hosting costs</li>
                <li>• Development tools and software licenses</li>
                <li>• New features and content development</li>
                <li>• Community events and tournaments</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <KoFiButton username="bumpervehicles" text="Support on Ko-Fi" />
            </div>
          </div>

          {/* Kickstarter Preview */}
          <div className="bg-black/30 rounded-lg p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Upcoming Kickstarter</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              Get ready for our upcoming Kickstarter campaign featuring exclusive rewards, 
              early access, and special in-game content for backers.
            </p>
            
            <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Kickstarter Rewards Preview:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Exclusive characters</li>
                <li>• Start with cash</li>
                <li>• Free Premium for life</li>
                <li>• Physical merchandise and collectibles</li>
                <li>• And more!</li>
              </ul>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                <strong>Coming Soon!</strong> Sign up for our newsletter to be notified when the Kickstarter launches.
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-black/30 rounded-lg p-8 border border-white/10 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-6">
              Get notified about our Kickstarter launch, new features, and exclusive updates.
            </p>
            <Link
              to="/#newsletter"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors duration-200"
            >
              Subscribe to Newsletter
            </Link>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export default SupportPage; 