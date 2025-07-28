// Environment-based configuration
export const getGameUrl = () => {
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  
  if (nodeEnv === 'production') {
    return import.meta.env.VITE_PROD_GAME_URL || 'https://app.bumpervehicles.com';
  } else {
    return import.meta.env.VITE_LOCAL_GAME_URL || 'http://localhost:5173';
  }
};

export const getApiUrl = () => {
  const nodeEnv = import.meta.env.VITE_NODE_ENV;
  
  if (nodeEnv === 'production') {
    return import.meta.env.VITE_PROD_API_URL || 'https://api.bumpervehicles.com';
  } else {
    return import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3000';
  }
}; 