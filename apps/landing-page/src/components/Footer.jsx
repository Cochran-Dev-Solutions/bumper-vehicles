import React from "react";
import { getGameUrl } from "../utils/config";
import KoFiButton from "./KoFiButton";

function Footer() {
  return (
    <footer className="bg-black/40 border-t border-white/10">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <p>&copy; {new Date().getFullYear()} Bumper Vehicles. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 items-center">
            <a
              href={getGameUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Play Game
            </a>
            <a
              href="/community"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Discord
            </a>
            <a
              href="/support"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 