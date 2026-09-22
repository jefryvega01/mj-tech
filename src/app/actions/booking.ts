"use server";

import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { bookingSchema } from "@/lib/validators";
import { getSession } from "@/lib/session";

export async function createBookingAction(formData: FormData) {
  const parsed = bookingSchema.safeParse({
    serviceId: formData.get("serviceId"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  });

  const serviceSlug = formData.get("serviceSlug")?.toString() || "";

  if (!parsed.success) {
    redirect(
      `/servicios/${serviceSlug}?error=${encodeURIComponent(
        parsed.error.issues[0]?.message || "Datos inválidos"
      )}`
    );
  }

  const session = await getSession();

  const [booking] = await db
    .insert(bookings)
    .values({
      ...parsed.data,
      userId: session?.userId,
    })
    .returning();

  redirect(`/servicios/reserva-confirmada/${booking.id}`);
}
