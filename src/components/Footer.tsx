export default function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 py-8 text-sm text-black/60 dark:border-white/10 dark:text-white/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-[#2563eb] dark:text-[#38bdf8]">
            MJ Tech
          </span>
          . Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
