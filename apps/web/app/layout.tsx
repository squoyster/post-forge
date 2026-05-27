import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "post-forge",
  description: "Content mining, review, and publishing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
