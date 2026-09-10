// Session & Workspace Identity Service
// Handles client-side private workspace ID generation, persistence, and fetch injection

const WORKSPACE_STORAGE_KEY = 'docreview_workspace_id';

/**
 * Generate a cryptographically secure, readable workspace ID
 * Example format: "doc_k9x3m2a7"
 */
export function generateWorkspaceId() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `doc_${rand}`;
}

/**
 * Get active workspace ID from localStorage, or initialize a new unique one
 */
export function getWorkspaceId() {
  if (typeof window === 'undefined') return 'default';
  
  let id = localStorage.getItem(WORKSPACE_STORAGE_KEY);
  if (!id || !id.trim()) {
    id = generateWorkspaceId();
    localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  }
  return id.trim();
}

/**
 * Switch to a specified workspace ID
 */
export function setWorkspaceId(newId) {
  if (typeof window === 'undefined') return;
  const cleanId = String(newId || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
  if (cleanId) {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, cleanId);
    window.dispatchEvent(new CustomEvent('workspace_changed', { detail: { workspaceId: cleanId } }));
  }
  return cleanId;
}

/**
 * Reset and create a brand new private workspace
 */
export function resetToNewWorkspace() {
  const newId = generateWorkspaceId();
  return setWorkspaceId(newId);
}

/**
 * Custom fetch wrapper that automatically injects the active workspace ID header
 */
export async function fetchWithSession(url, options = {}) {
  const workspaceId = getWorkspaceId();
  const headers = {
    ...(options.headers || {}),
    'x-session-id': workspaceId,
    'x-workspace-id': workspaceId
  };

  return fetch(url, {
    ...options,
    headers
  });
}
