// Dynamic Backend API & WebSocket URL configuration
// Supports VITE_API_URL env variable during build OR localStorage override in UI for easy deployment

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
    const customUrl = localStorage.getItem('DOCREVIEW_API_URL');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
    }

    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '');
    }

    // When running locally, default to http://localhost:5050 (or current LAN host on port 5050)
    if (isLocalEnvironment()) {
      const h = window.location.hostname;
      const host = (!h || h === '0.0.0.0') ? 'localhost' : h;
      return `http://${host}:5050`;
    }
  }
  return (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
};

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('DOCREVIEW_API_URL');
    } else {
      localStorage.setItem('DOCREVIEW_API_URL', url.trim().replace(/\/+$/, ''));
    }
  }
};

