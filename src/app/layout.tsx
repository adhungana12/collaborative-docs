import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollabDocs',
  description: 'A lightweight collaborative document editor',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontSize: '0.875rem',
              borderRadius: '10px',
              padding: '10px 16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}