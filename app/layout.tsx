import { Inter } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';
import '@/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Terraform Automation System - Azure Infrastructure Builder',
  description: 'Advanced Azure infrastructure design platform with intelligent, user-friendly architecture planning and enhanced visual diagnostics.',
  keywords: 'Azure, Terraform, Infrastructure, Cloud, DevOps, Infrastructure as Code',
  authors: [{ name: 'GeakMinds' }],
  creator: 'GeakMinds',
  openGraph: {
    title: 'Terraform Automation System - Azure Infrastructure Builder',
    description: 'Advanced Azure infrastructure design platform with intelligent, user-friendly architecture planning and enhanced visual diagnostics.',
    url: 'https://terraform-automation.replit.app',
    siteName: 'Terraform Automation System',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Terraform Automation System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terraform Automation System - Azure Infrastructure Builder',
    description: 'Advanced Azure infrastructure design platform with intelligent, user-friendly architecture planning and enhanced visual diagnostics.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}