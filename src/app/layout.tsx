import React from 'react';

export const metadata = {
  title: 'BetMyFriend',
  description: 'Modular Monolith PWA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
