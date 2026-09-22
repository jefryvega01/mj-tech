import Link from "next/link";
import { formatCLP } from "@/lib/format";
import type { Service } from "@/db/schema";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-black/10 transition-colors hover:border-[#2563eb]/40 dark:border-white/10 dark:hover:border-[#38bdf8]/40">
      <div className="flex aspect-[3/2] items-center justify-center overflow-hidden bg-gradient-to-br from-[#eff8ff] to-[#e0f2fe] text-3xl dark:from-[#0c1c2e] dark:to-[#0a1522]">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={service.imageUrl}
            alt={service.name}
            className="h-full w-full object-cover"
          />
        ) : (
          "🛠️"
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-medium">{service.name}</h3>
        <p className="line-clamp-2 text-sm text-black/60 dark:text-white/60">
          {service.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold">{formatCLP(service.price)}</span>
          <span className="text-xs text-black/50 dark:text-white/50">
            {service.durationMinutes} min
          </span>
        </div>
        <Link
          href={`/servicios/${service.slug}`}
          className="mt-2 rounded-full bg-[#2563eb] px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}
