import React from "react";
import { Link } from "react-router-dom";
import { Layout, NewsletterForm } from "../components";
import { getGameUrl } from "../utils/config";

function WelcomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Welcome to</span>{" "}
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 xl:inline">
                    Bumper Vehicles
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Experience the ultimate multiplayer racing game where physics meets strategy. 
                  Compete with friends in real-time, use power-ups, and master the art of bumper car combat!
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href={getGameUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                    >
                      Play Now
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/community"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-cyan-400 bg-transparent border-cyan-400 hover:bg-cyan-400 hover:text-white md:py-4 md:text-lg md:px-10 transition-all duration-200"
                    >
                      Join Community
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Game Description Section */}
      <section className="py-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-cyan-400 font-semibold tracking-wide uppercase">
              Game Overview
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Multiplayer Bumper Car Combat
            </p>
            <p className="mt-4 max-w-3xl text-xl text-gray-300 lg:mx-auto">
              Inspired by the Super Mario Bros boss fight against Bowser Jr, Bumper Vehicles 
              brings classic bumper car action into the digital age with modern multiplayer features.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">
                  Multiplayer Gameplay & Competition
                </p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Compete against players in individual and team-based challenges in race and battle arenas. 
                  See top players in seasonal leaderboards and collect trophies.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">
                  Solo Challenges
                </p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Train in the academy with solo challenges, seasonal events, and time-sensitive missions 
                  that earn gold, powerups, and unlock special achievements.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">
                  Character Collection & Upgrades
                </p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Hire different characters with unique bumper vehicles and asymmetric abilities. 
                  Use gold to upgrade vehicles and enhance capabilities for competitive advantage.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-white">
                  Power-Ups & Dangerous Environments
                </p>
                <p className="mt-2 ml-16 text-base text-gray-300">
                  Collect powerups in solo challenges and use them in multiplayer arenas. 
                  Compete in various arenas with dangerous environmental elements for exciting gameplay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-cyan-400 font-semibold tracking-wide uppercase">
              Gameplay Preview
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              See Bumper Vehicles in Action
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-96 rounded-lg shadow-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 text-gray-400">🎮</div>
                    <h3 className="text-3xl font-bold text-white mb-2">Coming Soon</h3>
                    <p className="text-gray-400 text-lg">Gameplay video will be available here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section id="newsletter" className="py-12 bg-black/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-300">
              Get the latest news, updates, and exclusive content delivered to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>
    </Layout>
  );
}

export default WelcomePage; 