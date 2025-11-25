import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'TiffinTrack',
  description: 'Monthly mess tiffin management app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed inset-0 -z-10 h-full w-full bg-background">
            <div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,hsl(var(--primary)/0.2),transparent)]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] top-0 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,hsl(var(--accent)/0.2),transparent)]"></div>
          </div>
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
          <div id="recaptcha-container"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
