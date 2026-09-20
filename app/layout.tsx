import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'GoalPredict AI | Data-driven Football Match Predictions',
  description: 'Professional football match prediction platform powered by statistical analytics, team form metrics, and transparent baseline probability models.',
  openGraph: {
    title: 'GoalPredict AI | Data-driven Football Match Predictions',
    description: 'Professional football match prediction platform powered by statistical analytics, team form metrics, and transparent baseline probability models.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GoalPredict AI | Data-driven Football Match Predictions',
    description: 'Professional football match prediction platform powered by statistical analytics, team form metrics, and transparent baseline probability models.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
