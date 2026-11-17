import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AHT | Business Systems & IT Solutions",
  description:
    "Helping businesses organize their systems, operations and data through practical technology solutions.",
  applicationName: "AHT — Ali Hany Technology"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
