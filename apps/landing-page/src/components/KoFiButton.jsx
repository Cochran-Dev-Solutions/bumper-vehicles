import React from 'react';
import './KoFiButton.css';

const KoFiButton = ({ text = "Support Us", className = "" }) => {
  const koFiUrl = `https://ko-fi.com/bumpervehicles`;
  
  return (
    <a 
      href={koFiUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`ko-fi-button ${className}`}
    >
      <div className="ko-fi-content">
        <svg 
          className="ko-fi-icon" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span className="ko-fi-text">{text}</span>
      </div>
    </a>
  );
};

export default KoFiButton; 