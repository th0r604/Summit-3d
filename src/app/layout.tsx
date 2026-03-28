import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "CFFF — Canadian Functional Fitness Federation",
  description: "Management dashboard for the Canadian Functional Fitness Federation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased flex">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-auto">{children}</main>
      </body>
    </html>
  );
}
