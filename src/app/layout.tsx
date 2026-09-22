import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "MJ Tech",
  description: "Tecnología para todo Chile — productos y servicios online",
  icons: {
    icon: "/logo-icon.png",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-black dark:bg-neutral-950 dark:text-white">
        <CartProvider>
          <Header
            session={
              session ? { name: session.name, role: session.role } : null
            }
          />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
