// Dynamic Backend API & WebSocket URL configuration
// Supports VITE_API_URL env variable during build OR localStorage override in UI for easy deployment

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('DOCREVIEW_API_URL');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '');
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
