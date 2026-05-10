/**
 * Loading Screen Management Utility
 * Handles entry loading, page transitions, and auth flows
 */

import { clearAuthSessionStorage, validateAndRefreshAuthSession } from './authSession';

interface LoadingManager {
  show: (text?: string) => void;
  hide: (delay?: number) => void;
  hideEntry: (delay?: number) => void;
}

/**
 * Get or create DOM element for entry loading screen
 */
function getEntryLoading(): HTMLElement | null {
  return document.getElementById('entry-loading');
}

/**
 * Show fullscreen loading overlay
 * Used for auth flows and page transitions
 */
export function showLoading(text: string = 'Loading...'): void {
  // Check if entry loading screen exists
  const entryLoading = getEntryLoading();
  
  if (entryLoading) {
    // Use entry loading screen if it exists
    entryLoading.classList.remove('hidden');
    const titleEl = entryLoading.querySelector('.entry-loading-title') as HTMLElement;
    if (titleEl) {
      titleEl.textContent = text;
    }
  } else {
    // Create fullscreen loading overlay dynamically if entry loading doesn't exist
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-loading';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #020617 0%, #0f172a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(10px);
    `;

    overlay.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2rem; position: relative; z-index: 10;">
        <div style="position: relative; width: 64px; height: 64px;">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #3b82f6;
            border-right-color: #a855f7;
            animation: spin-cw 2.5s linear infinite;
          "></div>
          <div style="
            position: absolute;
            width: 80%;
            height: 80%;
            top: 10%;
            left: 10%;
            border-radius: 50%;
            border: 3px solid transparent;
            border-bottom-color: #3b82f6;
            border-left-color: #a855f7;
            animation: spin-ccw 3.5s linear infinite;
          "></div>
        </div>
        <div style="text-align: center;">
          <h3 style="font-size: 1.25rem; font-weight: 600; color: #ffffff; margin: 0;">${text}</h3>
          <p style="font-size: 0.875rem; color: #94a3b8; margin: 0.5rem 0 0 0;">Please wait...</p>
        </div>
      </div>

      <style>
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
      </style>
    `;

    document.body.appendChild(overlay);
  }
}

/**
 * Hide fullscreen loading overlay
 */
export function hideLoading(delay: number = 0): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entryLoading = getEntryLoading();
      if (entryLoading) {
        entryLoading.classList.add('hidden');
      }

      const dynamicLoading = document.getElementById('dynamic-loading');
      if (dynamicLoading) {
        dynamicLoading.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        dynamicLoading.style.opacity = '0';
        setTimeout(() => {
          dynamicLoading.remove();
          resolve();
        }, 400);
      } else {
        resolve();
      }
    }, delay);
  });
}

/**
 * Hide entry loading screen specifically
 * Called when React app is ready to mount
 */
export function hideEntryLoading(delay: number = 300): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const entryLoading = getEntryLoading();
      if (entryLoading) {
        entryLoading.classList.add('hidden');
      }
      resolve();
    }, delay);
  });
}

/**
 * Check if user is authenticated
 */
export function isUserAuthenticated(): boolean {
  try {
    return validateAndRefreshAuthSession();
  } catch {
    return false;
  }
}

/**
 * Get stored user data
 */
export function getStoredUser(): any {
  try {
    const isValid = validateAndRefreshAuthSession();
    if (!isValid) return null;

    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Clear user authentication
 */
export function clearAuth(): void {
  try {
    clearAuthSessionStorage();
  } catch {
    // Silently fail
  }
}

/**
 * Initialize loading screen on entry
 * Call this immediately to set up loading state
 */
export function initializeEntryLoading(): void {
  const entryLoading = getEntryLoading();
  if (entryLoading) {
    // Ensure it starts visible
    entryLoading.classList.remove('hidden');
  }
}
