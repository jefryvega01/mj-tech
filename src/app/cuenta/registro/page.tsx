import Link from "next/link";
import { registerAction } from "@/app/actions/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-10">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={registerAction} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Nombre completo
          <input
            name="name"
            required
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Correo electrónico
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Crear cuenta
        </button>
      </form>

      <p className="text-sm text-black/60 dark:text-white/60">
        ¿Ya tienes cuenta?{" "}
        <Link href="/cuenta/login" className="underline">
          Ingresa aquí
        </Link>
      </p>
    </div>
  );
}
