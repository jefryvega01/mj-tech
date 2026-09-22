import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";

export default async function BookingConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await db.query.bookings.findFirst({
    where: (b, { eq }) => eq(b.id, Number(id)),
    with: { service: true },
  });

  if (!booking) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
      <div className="text-4xl">✅</div>
      <h1 className="text-2xl font-semibold">¡Reserva confirmada!</h1>
      <p className="text-black/60 dark:text-white/60">
        Reservaste <strong>{booking.service.name}</strong> para el{" "}
        {booking.date} a las {booking.time}. Te contactaremos a{" "}
        {booking.customerEmail} para confirmar los detalles.
      </p>
      <Link
        href="/servicios"
        className="mt-2 rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 dark:bg-[#38bdf8] dark:text-[#04141f]"
      >
        Volver a servicios
      </Link>
    </div>
  );
}
