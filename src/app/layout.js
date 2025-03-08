import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export const metadata = {
  title: 'Kern River Valley Dashboard',
  description: 'Live updates for the Kern River Valley community',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-64.png', sizes: '64x64', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon.svg',
        color: '#1e3a8a'
      }
    ]
  },
  manifest: '/manifest.json',
  themeColor: '#1e3a8a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KRV.APP'
  },
  applicationName: 'Kern River Valley App',
  formatDetection: {
    telephone: false
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/icon-64.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-gray-900 text-white min-h-screen">{children}</body>
    </html>
  );
}