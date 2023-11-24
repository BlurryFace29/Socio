import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import './globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { Provider } from '@/components/Provider';

export const metadata = {
  title: 'Blockto',
  description: 'Ensuring Content Authenticity in the Age of Deepfakes',
  keywords:
    'blockto, decentralized, censorship-resistant, social media, social network, deepfake buster',
  robots: 'index, follow',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full w-full" data-theme="iris">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="overflow-x-hidden">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
