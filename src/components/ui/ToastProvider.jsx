/**
 * Toast Notification Component
 * Provides toast notifications using react-hot-toast
 */

'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#171717',
          color: '#f3f4f6',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#22d3ee',
            secondary: '#171717',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#171717',
          },
        },
      }}
    />
  );
}
