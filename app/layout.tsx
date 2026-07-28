import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./styles.css";

export const metadata: Metadata = {
  title: "ThatAssistant OS — VA Edition",
  description: "Repository foundation for ThatAssistant OS VA Edition.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
