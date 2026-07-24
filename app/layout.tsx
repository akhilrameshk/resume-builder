import type { Metadata } from 'next';
import { CssBaseline } from '@mui/material';

export const metadata: Metadata = {
  title: 'ATS Friendly Resume Builder',
  description: 'Generate ATS-optimized PDF resumes directly in your browser.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        {children}
      </body>
    </html>
  );
}