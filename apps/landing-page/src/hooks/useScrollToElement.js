import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToElement = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL
    if (location.hash) {
      // Remove the # from the hash
      const elementId = location.hash.substring(1);
      const element = document.getElementById(elementId);
      
      if (element) {
        // Add a small delay to ensure the page has rendered
        setTimeout(() => {
          // Get the navigation height (sticky header)
          const nav = document.querySelector('nav');
          const navHeight = nav ? nav.offsetHeight : 0;
          
          // Calculate the scroll position
          const elementPosition = element.offsetTop - navHeight - 20; // 20px extra padding
          
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [location]);
}; 