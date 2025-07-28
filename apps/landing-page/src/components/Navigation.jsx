import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">Bumper Vehicles</Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/community"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/community') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Community
              </Link>
              <Link
                to="/architecture"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/architecture') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Architecture
              </Link>
              <Link
                to="/join-team"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/join-team') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Join Team
              </Link>
              <Link
                to="/beta-testing"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/beta-testing') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Beta Testing
              </Link>
              <Link
                to="/support"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/support') ? 'text-white bg-cyan-600' : 'text-gray-300 hover:text-white'
                }`}
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation; 