import { db } from "@/db";
import ServiceCard from "@/components/ServiceCard";

export const metadata = { title: "Servicios · Mi Tienda" };

export default async function ServicesPage() {
  const items = await db.query.services.findMany({
    where: (s, { eq }) => eq(s.active, true),
    orderBy: (s, { desc }) => desc(s.createdAt),
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Servicios</h1>
      {items.length === 0 ? (
        <p className="text-black/60 dark:text-white/60">
          Todavía no hay servicios publicados.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
