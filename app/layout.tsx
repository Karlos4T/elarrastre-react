import type { Metadata } from "next";
import { Baloo_2, League_Spartan, Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";
import ToastProvider from "./components/ToastProvider";

const baloo = Baloo_2({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});


const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = League_Spartan({
  variable: "--font-secondary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "El Arrastre Solidario",
  description:
    "Comunidad solidaria en movimiento: inscripciones, colaboradores y propuestas para apoyar la lucha contra la ELA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" translate="no">
      <body
        className={`${baloo.variable} ${spaceGrotesk.variable} ${leagueSpartan.variable} ${poppins.variable}  antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
