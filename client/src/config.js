// Dynamic Backend API & WebSocket URL configuration
// Fixed Production Backend URL: https://rewgenrator.onrender.com

export const DEFAULT_PRODUCTION_API_URL = 'https://rewgenrator.onrender.com';

export const isLocalEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return (
    Boolean(import.meta.env.DEV) ||
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h === '[::1]' ||
    h.endsWith('.local') ||
    h.startsWith('192.168.') ||
    h.startsWith('10.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(h)
  );
};

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // 1. Check if user explicitly set a custom URL in localStorage
    const customUrl = localStorage.getItem('DOCREVIEW_API_URL');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }

    // 2. Check if build-time environment variable is provided
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    }

    // 3. When running in local development mode, connect to localhost:5050
    if (isLocalEnvironment()) {
      const h = window.location.hostname;
      const host = (!h || h === '0.0.0.0') ? 'localhost' : h;
      return `http://${host}:5050`;
    }
  }

  // 4. Default fixed backend URL for GitHub Pages / Vercel / production
  return DEFAULT_PRODUCTION_API_URL;
};

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim() || url.trim() === DEFAULT_PRODUCTION_API_URL) {
      localStorage.removeItem('DOCREVIEW_API_URL');
    } else {
      localStorage.setItem('DOCREVIEW_API_URL', url.trim().replace(/\/+$/, ''));
    }
  }
};
