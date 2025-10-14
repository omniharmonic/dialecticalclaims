import type { Metadata } from 'next'
import { Inter, Crimson_Text } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Dialectical.Claims - The Arena of Synthetic Thought',
  description:
    'AI-mediated philosophical discourse where ideas collide, evolve, and transcend through structured dialectical combat.',
  keywords: [
    'philosophy',
    'AI',
    'dialectics',
    'synthesis',
    'philosophical debate',
    'artificial intelligence',
  ],
  authors: [{ name: 'Dialectical.Claims Team' }],
  creator: 'Dialectical.Claims',
  publisher: 'Dialectical.Claims',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dialectical.claims',
    siteName: 'Dialectical.Claims',
    title: 'Dialectical.Claims - The Arena of Synthetic Thought',
    description: 'AI-mediated philosophical discourse where ideas collide, evolve, and transcend.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dialectical.Claims - The Arena of Synthetic Thought',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dialectical.Claims - The Arena of Synthetic Thought',
    description: 'AI-mediated philosophical discourse where ideas collide, evolve, and transcend.',
    images: ['/og-image.png'],
    creator: '@dialecticalclaims',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${crimsonText.variable} font-sans antialiased`}>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
