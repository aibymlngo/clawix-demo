import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/components/auth-provider';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clawix',
  description: 'Enterprise-grade multi-agent AI orchestration platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Clawix',
  },
  icons: {
    icon: '/icons/favicon-32x32.png',
    apple: '/icons/apple-icon-180x180.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090B',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
