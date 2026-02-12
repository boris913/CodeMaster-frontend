import type { Metadata } from 'next';
import { Inter, Lexend, Fira_Code } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/header';
import { ClientSidebarWrapper } from '@/components/layout/client-sidebar-wrapper';
import { AuthInitializer } from '@/components/auth/authInitializer';
import { cn } from '@/lib/utils';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CodeMaster - Plateforme E-Learning',
    template: '%s | CodeMaster',
  },
  description: 'Plateforme moderne d\'apprentissage de la programmation',
  keywords: ['programmation', 'cours', 'e-learning', 'code', 'tutoriels'],
  authors: [{ name: 'CodeMaster Team' }],
  creator: 'CodeMaster',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'CodeMaster - Plateforme E-Learning',
    description: 'Plateforme moderne d\'apprentissage de la programmation',
    siteName: 'CodeMaster',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeMaster - Plateforme E-Learning',
    description: 'Plateforme moderne d\'apprentissage de la programmation',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body 
        className={cn(
          `${inter.variable} ${lexend.variable} ${firaCode.variable} font-sans antialiased`,
          'min-h-screen bg-background'
        )}
      >
        <AuthInitializer />
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
              <ClientSidebarWrapper />
              <main className="flex-1 p-6 lg:p-8">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}