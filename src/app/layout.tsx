import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  variable: "--font-vt323",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anish Naik — Terminal",
  description: "Portfolio of Anish Naik, software and AI developer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${vt323.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement.dataset;d.crt=localStorage.getItem("crt")||"on";d.sound=localStorage.getItem("sound")||"off";if(sessionStorage.getItem("booted")||matchMedia("(prefers-reduced-motion: reduce)").matches)d.booted="1"}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
