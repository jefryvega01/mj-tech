"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";

type Props = {
  session: { name: string; role: "cliente" | "admin" } | null;
};

export default function Header({ session }: Props) {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt="MJ Tech"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="brand-gradient-text text-lg font-bold tracking-tight">
            MJ Tech
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <Link href="/productos" className="hover:opacity-70">
            Productos
          </Link>
          <Link href="/servicios" className="hover:opacity-70">
            Servicios
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/carrito"
            className="relative rounded-full border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            Carrito
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-xs text-white dark:bg-[#38bdf8] dark:text-[#04141f]">
                {totalItems}
              </span>
            )}
          </Link>

          {session ? (
            <Link
              href="/cuenta"
              className="rounded-full bg-[#2563eb] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
            >
              {session.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/cuenta/login"
              className="rounded-full bg-[#2563eb] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
            >
              Ingresar
            </Link>
          )}

          <button
            type="button"
            className="rounded-md border border-black/10 p-1.5 sm:hidden dark:border-white/15"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/10 px-4 py-3 sm:hidden dark:border-white/10">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <Link href="/productos" onClick={() => setOpen(false)}>
              Productos
            </Link>
            <Link href="/servicios" onClick={() => setOpen(false)}>
              Servicios
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
