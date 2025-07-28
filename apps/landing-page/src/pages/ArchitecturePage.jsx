import React from "react";
import { Layout } from "../components";

function ArchitecturePage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Technology Stack Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Technology Stack</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technologies for scalability, performance, and maintainability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Development & Package Management</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Git monorepo setup with PNPM + Turbo</li>
                <li>• Workspace-based package management</li>
                <li>• Shared logic packages for code reuse</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Backend Infrastructure</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Node.js with Fastify framework</li>
                <li>• MySQL database for persistent data</li>
                <li>• Redis for caching and real-time features</li>
                <li>• WebSocket connections for live gameplay</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Frontend Applications</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Web app: HTML/CSS/JS + p5.js rendering</li>
                <li>• Mobile app: React Native + Skia rendering</li>
                <li>• Shared frontend logic package</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">DevOps & Deployment</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• CI/CD with GitHub Actions</li>
                <li>• AWS cloud infrastructure</li>
                <li>• Docker containerization</li>
                <li>• Automated testing and linting</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Game Architecture</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Server-authoritative physics engine</li>
                <li>• Real-time multiplayer synchronization</li>
                <li>• Modular entity-component system</li>
                <li>• Scene-based rendering architecture</li>
              </ul>
            </div>

            <div className="bg-black/30 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-medium text-white mb-4">Performance & Scalability</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• 60 FPS physics updates</li>
                <li>• Efficient collision detection</li>
                <li>• Optimized rendering pipelines</li>
                <li>• Horizontal scaling capabilities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Game Design Architecture Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Game Design Architecture
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sophisticated architecture that separates concerns while maintaining tight integration.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-black/30 rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-medium text-white mb-4">Backend Game Logic</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">Database & Caching Layer</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Database package for MySQL operations</li>
                    <li>• Redis package for caching and real-time data</li>
                    <li>• User authentication and session management</li>
                    <li>• Game state persistence and recovery</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">API & Routing Layer</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Fastify framework for high-performance APIs</li>
                    <li>• Modular controllers and routes structure</li>
                    <li>• RESTful endpoints for game operations</li>
                    <li>• WebSocket integration for real-time communication</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-medium text-white mb-4">Game Engine & Physics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">Core Game Engine</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Game class manages multiple game instances</li>
                    <li>• PhysicsWorld handles collision detection and physics</li>
                    <li>• Entity system with inheritance hierarchy</li>
                    <li>• TileMap for level design and collision mapping</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">Real-Time Synchronization</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• WebSocket manager for connection handling</li>
                    <li>• 60 FPS physics update loop</li>
                    <li>• Player input processing and validation</li>
                    <li>• Game state broadcasting to all clients</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-8 border border-white/10">
              <h3 className="text-xl font-medium text-white mb-4">Frontend Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">Shared Logic Package</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Event management (mouse, keyboard, scene)</li>
                    <li>• Game actor classes for visual representation</li>
                    <li>• Networking layer (WebSocket, AJAX)</li>
                    <li>• Utility functions and global state management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-cyan-400 mb-2">Application-Specific Logic</h4>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Web: p5.js rendering with scene management</li>
                    <li>• Mobile: React Native with Skia rendering</li>
                    <li>• GameRenderer syncs with backend game state</li>
                    <li>• Modular scene system for different game areas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Home Button */}
        <div className="text-center mt-12">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white font-medium rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </Layout>
  );
}

export default ArchitecturePage; 