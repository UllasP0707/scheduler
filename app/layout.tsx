import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weekwise · Staff Scheduler",
  description:
    "Build a clear weekly staff schedule, calculate hours, and print a polished team rota.",
};

/**
 * There is no app chrome: no top bar, no sidebar, no footer. Each screen is a
 * page column and nothing else, and the only way between the two is the
 * segmented control in their own headers (components/ScreenTop).
 *
 * One theme, and it is light, so there is no pre-paint script here either - the
 * HTML this ships IS the finished colour scheme.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body>{children}</body>
    </html>
  );
}
