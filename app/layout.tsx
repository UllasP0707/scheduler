import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekwise · Staff Scheduler",
  description:
    "Build a clear weekly staff schedule, calculate hours, and print a polished team rota.",
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
