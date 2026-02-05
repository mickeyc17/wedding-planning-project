import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Project Tracker",
  description: "Plan your wedding together with a shared Kanban board."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
