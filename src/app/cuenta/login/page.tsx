import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-10">
      <h1 className="text-2xl font-semibold">Ingresar</h1>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <form action={loginAction} className="flex flex-col gap-3">
        <input type="hidden" name="redirectBase" value="/cuenta" />

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
            className="rounded-lg border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Ingresar
        </button>
      </form>

      <p className="text-sm text-black/60 dark:text-white/60">
        ¿No tienes cuenta?{" "}
        <Link href="/cuenta/registro" className="underline">
          Crea una aquí
        </Link>
      </p>
    </div>
  );
}
