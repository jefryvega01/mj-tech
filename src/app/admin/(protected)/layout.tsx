import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/inicio", label: "Página de inicio" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <aside className="flex shrink-0 flex-col gap-1 sm:w-48">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40 dark:text-white/40">
          Administración
        </p>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}
        <form action={logoutAction} className="pt-2">
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
